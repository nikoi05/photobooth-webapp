/**
 * filter-engine/index.js
 *
 * Single source of truth for filter rendering.
 *
 * Exports:
 *   adjustmentsToCss(adjustments)  — CSS string for browser preview only
 *   applyPixelFilter(imageData, adjustments) — deterministic pixel processing for export
 *
 * The pixel math uses the W3C CSS filter matrix spec, identical to what the
 * server-side filterService.js uses with Sharp. This guarantees:
 *
 *   preview (CSS)  ≈  export (pixel math)  ≈  server (Sharp recomb)
 *
 * Why pixel math instead of ctx.filter?
 *   ctx.filter is rendered by the browser's compositor. iOS Safari implements
 *   it differently from Chrome/Edge — colours, contrast, and sepia tones can
 *   all diverge. ImageData pixel manipulation is deterministic: same numbers
 *   in, same pixels out, on every browser.
 */

// ─── W3C matrix helpers ───────────────────────────────────────────────────────

function matMul(A, B) {
    const C = [[0,0,0],[0,0,0],[0,0,0]];
    for (let i = 0; i < 3; i++)
        for (let j = 0; j < 3; j++)
            for (let k = 0; k < 3; k++)
                C[i][j] += A[i][k] * B[k][j];
    return C;
}

function chain(...matrices) {
    return matrices.reduce((acc, m) => matMul(acc, m));
}

// ─── W3C filter matrices (match CSS spec exactly) ─────────────────────────────

function mBrightness(a) {
    return [[a,0,0],[0,a,0],[0,0,a]];
}

function mSaturate(a) {
    return [
        [0.213 + 0.787*a,  0.715 - 0.715*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 + 0.285*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 - 0.715*a,  0.072 + 0.928*a],
    ];
}

function mGrayscale(a) {
    // grayscale(1) = saturate(0)
    return mSaturate(1 - a);
}

function mSepia(a) {
    return [
        [0.393*a + (1-a),  0.769*a,            0.189*a          ],
        [0.349*a,           0.686*a + (1-a),    0.168*a          ],
        [0.272*a,           0.534*a,             0.131*a + (1-a) ],
    ];
}

function mHueRotate(deg) {
    const rad = deg * Math.PI / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
        [0.213 + c*0.787 - s*0.213,  0.715 - c*0.715 - s*0.715,  0.072 - c*0.072 + s*0.928],
        [0.213 - c*0.213 + s*0.143,  0.715 + c*0.285 + s*0.140,  0.072 - c*0.072 - s*0.283],
        [0.213 - c*0.213 - s*0.787,  0.715 - c*0.715 + s*0.715,  0.072 + c*0.928 + s*0.072],
    ];
}

// ─── adjustmentsToCss ─────────────────────────────────────────────────────────

/**
 * Converts filter adjustments to a CSS filter string.
 * Used ONLY for browser preview — not for export.
 *
 * @param {object} adjustments
 * @returns {string}
 */
export function adjustmentsToCss(adjustments) {
    if (!adjustments) return "none";

    const parts = [];

    // Emit in the same order the operations array defines them
    // so the CSS preview matches what the pixel engine produces
    if (adjustments.grayscale  != null && adjustments.grayscale  !== 0) parts.push(`grayscale(${adjustments.grayscale})`);
    if (adjustments.sepia      != null && adjustments.sepia      !== 0) parts.push(`sepia(${adjustments.sepia})`);
    if (adjustments.saturate   != null && adjustments.saturate   !== 1) parts.push(`saturate(${adjustments.saturate})`);
    if (adjustments.hueRotate  != null && adjustments.hueRotate  !== 0) parts.push(`hue-rotate(${adjustments.hueRotate}deg)`);
    if (adjustments.brightness != null && adjustments.brightness !== 1) parts.push(`brightness(${adjustments.brightness})`);
    if (adjustments.contrast   != null && adjustments.contrast   !== 1) parts.push(`contrast(${adjustments.contrast})`);

    return parts.length > 0 ? parts.join(" ") : "none";
}

// ─── applyPixelFilter ─────────────────────────────────────────────────────────

/**
 * Applies filter adjustments to an ImageData object in place.
 *
 * Pipeline per pixel:
 *   1. Build a combined colour matrix from grayscale + sepia + saturate + hueRotate + brightness
 *   2. Apply the matrix to each RGB pixel
 *   3. Apply contrast as a linear scale around mid-grey (128) — same as CSS spec
 *   4. Clamp all values to [0, 255]
 *   5. Alpha channel is never touched
 *
 * @param {ImageData} imageData  — modified in place
 * @param {object}    adjustments
 */
export function applyPixelFilter(imageData, adjustments) {
    if (!adjustments) return;

    const {
        grayscale  = 0,
        sepia      = 0,
        saturate   = 1,
        hueRotate  = 0,
        brightness = 1,
        contrast   = 1,
    } = adjustments;

    // ── Build combined colour matrix in operation order ────────────
    // Order matches the operations array in FilterPicker:
    //   grayscale → sepia → saturate → hueRotate → brightness
    const matrices = [];

    if (grayscale  !== 0) matrices.push(mGrayscale(grayscale));
    if (sepia      !== 0) matrices.push(mSepia(sepia));
    if (saturate   !== 1) matrices.push(mSaturate(saturate));
    if (hueRotate  !== 0) matrices.push(mHueRotate(hueRotate));
    if (brightness !== 1) matrices.push(mBrightness(brightness));

    const useMatrix = matrices.length > 0;
    const mat = useMatrix ? chain(...matrices) : null;

    // ── Contrast offset (CSS spec: scale around 128) ───────────────
    const useContrast = contrast !== 1;
    const contrastOffset = 128 * (1 - contrast);

    // ── Pixel loop ─────────────────────────────────────────────────
    const data = imageData.data;
    const len  = data.length;

    for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        // data[i + 3] = alpha — never touched

        // Apply colour matrix
        if (useMatrix) {
            const [m0, m1, m2] = mat;
            const nr = m0[0]*r + m0[1]*g + m0[2]*b;
            const ng = m1[0]*r + m1[1]*g + m1[2]*b;
            const nb = m2[0]*r + m2[1]*g + m2[2]*b;
            r = nr; g = ng; b = nb;
        }

        // Apply contrast
        if (useContrast) {
            r = contrast * r + contrastOffset;
            g = contrast * g + contrastOffset;
            b = contrast * b + contrastOffset;
        }

        // Clamp to [0, 255]
        data[i]     = r < 0 ? 0 : r > 255 ? 255 : r;
        data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
        data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    }
}
