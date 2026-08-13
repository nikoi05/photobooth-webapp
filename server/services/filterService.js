/**
 * filterService.js
 *
 * Replicates CSS filter chains exactly using Sharp's .recomb() colour matrix.
 * Each filter matches the CSS string in FilterPicker.jsx precisely.
 *
 * Sharp .recomb() row format:
 *   matrix[0] = [how much R comes from R, G, B]
 *   matrix[1] = [how much G comes from R, G, B]
 *   matrix[2] = [how much B comes from R, G, B]
 * This is identical to the W3C CSS filter matrix spec — no transpose needed.
 *
 * CSS contrast(a) uses an additive offset so it's handled separately via
 * .linear(a, 128*(1-a)) which scales around mid-grey (128), matching browsers.
 */

// ─── Matrix helpers ───────────────────────────────────────────────────────────

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

// ─── W3C CSS filter matrices ──────────────────────────────────────────────────

function mBrightness(a) {
    return [[a,0,0],[0,a,0],[0,0,a]];
}

/** W3C saturate matrix — a=1 is original, a=0 is greyscale */
function mSaturate(a) {
    return [
        [0.213 + 0.787*a,  0.715 - 0.715*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 + 0.285*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 - 0.715*a,  0.072 + 0.928*a],
    ];
}

/** W3C grayscale — equivalent to saturate(1-a), a=1 is full grey */
function mGrayscale(a) {
    return mSaturate(1 - a);
}

/** W3C sepia matrix */
function mSepia(a) {
    return [
        [0.393*a + (1-a),  0.769*a,           0.189*a         ],
        [0.349*a,           0.686*a + (1-a),   0.168*a         ],
        [0.272*a,           0.534*a,            0.131*a + (1-a)],
    ];
}

/** W3C hue-rotate matrix */
function mHueRotate(deg) {
    const rad = deg * Math.PI / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    return [
        [0.213 + c*0.787 - s*0.213,  0.715 - c*0.715 - s*0.715,  0.072 - c*0.072 + s*0.928],
        [0.213 - c*0.213 + s*0.143,  0.715 + c*0.285 + s*0.140,  0.072 - c*0.072 - s*0.283],
        [0.213 - c*0.213 - s*0.787,  0.715 - c*0.715 + s*0.715,  0.072 + c*0.928 + s*0.072],
    ];
}

/** CSS contrast centered on mid-grey (128) — matches browser behaviour */
function applyContrast(image, a) {
    return image.linear(a, 128 * (1 - a));
}

// ─── Filter application ───────────────────────────────────────────────────────

export function applyFilter(image, filterId) {

    switch (filterId) {

        case "none":
            return image;

        // CSS: sepia(0.5) saturate(1.3) brightness(1.08) contrast(0.95)
        case "sandali":
            return applyContrast(
                image.recomb(chain(mSepia(0.5), mSaturate(1.3), mBrightness(1.08))),
                0.95
            );

        // CSS: sepia(0.7) saturate(1.6) brightness(1.1) contrast(0.9)
        case "golden":
            return applyContrast(
                image.recomb(chain(mSepia(0.7), mSaturate(1.6), mBrightness(1.1))),
                0.9
            );

        // CSS: sepia(0.2) contrast(0.8) brightness(1.15) saturate(0.7)
        case "faded":
            return applyContrast(
                image.recomb(chain(mSepia(0.2), mSaturate(0.7), mBrightness(1.15))),
                0.8
            );

        // CSS: grayscale(1) contrast(1.1) brightness(1.05)
        case "mono":
            return applyContrast(
                image.recomb(chain(mGrayscale(1), mBrightness(1.05))),
                1.1
            );

        // CSS: grayscale(1) contrast(1.5) brightness(0.88)
        case "noir":
            return applyContrast(
                image.recomb(chain(mGrayscale(1), mBrightness(0.88))),
                1.5
            );

        // CSS: sepia(0.6) saturate(1.8) hue-rotate(-10deg) brightness(0.95) contrast(1.05)
        case "terracotta":
            return applyContrast(
                image.recomb(chain(mSepia(0.6), mSaturate(1.8), mHueRotate(-10), mBrightness(0.95))),
                1.05
            );

        default:
            return image;
    }
}
