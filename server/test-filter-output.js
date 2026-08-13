/**
 * Generates test strips for every filter so you can visually compare
 * them against the browser CSS preview side-by-side.
 *
 * Run:  node test-filter-output.js
 * Output: ./filter-test-output/ folder with one image per filter.
 */
import sharp from "sharp";
import fs from "fs/promises";
import path from "path";

// ─── Matrix helpers ──────────────────────────────────────────────

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

// ─── W3C CSS filter matrices ─────────────────────────────────────
// Sharp .recomb() row format: output[row] = sum of input[col] * matrix[row][col]
// i.e. matrix[0] = [how much R gets from R, how much R gets from G, how much R gets from B]
// This matches the W3C spec directly — no transpose needed.

function mBrightness(a) {
    return [[a,0,0],[0,a,0],[0,0,a]];
}

function mSaturate(a) {
    // W3C saturate matrix
    return [
        [0.213 + 0.787*a,  0.715 - 0.715*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 + 0.285*a,  0.072 - 0.072*a],
        [0.213 - 0.213*a,  0.715 - 0.715*a,  0.072 + 0.928*a],
    ];
}

function mGrayscale(a) {
    // W3C grayscale = saturate(1-a), a=1 → full grey
    return mSaturate(1 - a);
}

function mSepia(a) {
    // W3C sepia matrix
    return [
        [0.393*a + (1-a),  0.769*a,           0.189*a          ],
        [0.349*a,           0.686*a + (1-a),   0.168*a          ],
        [0.272*a,           0.534*a,            0.131*a + (1-a) ],
    ];
}

function mHueRotate(deg) {
    const rad = deg * Math.PI / 180;
    const c = Math.cos(rad), s = Math.sin(rad);
    // W3C hue-rotate matrix
    return [
        [0.213 + c*0.787 - s*0.213,   0.715 - c*0.715 - s*0.715,   0.072 - c*0.072 + s*0.928],
        [0.213 - c*0.213 + s*0.143,   0.715 + c*0.285 + s*0.140,   0.072 - c*0.072 - s*0.283],
        [0.213 - c*0.213 - s*0.787,   0.715 - c*0.715 + s*0.715,   0.072 + c*0.928 + s*0.072],
    ];
}

function applyContrast(image, a) {
    // CSS contrast centered on 128 (mid-grey)
    return image.linear(a, 128 * (1 - a));
}

// ─── Filter definitions (mirror FilterPicker.jsx exactly) ────────

const FILTERS = {
    none:       (img) => img,
    sandali:    (img) => applyContrast(img.recomb(chain(mSepia(0.5), mSaturate(1.3), mBrightness(1.08))), 0.95),
    golden:     (img) => applyContrast(img.recomb(chain(mSepia(0.7), mSaturate(1.6), mBrightness(1.1))),  0.9),
    faded:      (img) => applyContrast(img.recomb(chain(mSepia(0.2), mSaturate(0.7), mBrightness(1.15))), 0.8),
    mono:       (img) => applyContrast(img.recomb(chain(mGrayscale(1), mBrightness(1.05))),               1.1),
    noir:       (img) => applyContrast(img.recomb(chain(mGrayscale(1), mBrightness(0.88))),               1.5),
    terracotta: (img) => applyContrast(img.recomb(chain(mSepia(0.6), mSaturate(1.8), mHueRotate(-10), mBrightness(0.95))), 1.05),
};

// ─── Create a vivid test gradient image (covers reds, greens, blues, skin tones)
async function createTestImage() {
    const w = 400, h = 300;
    const pixels = Buffer.alloc(w * h * 3);
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            const i = (y * w + x) * 3;
            // Horizontal: red→green gradient. Vertical: blue gradient
            pixels[i]   = Math.round((x / w) * 255);           // R
            pixels[i+1] = Math.round((1 - x / w) * 200);       // G
            pixels[i+2] = Math.round((y / h) * 255);           // B
        }
    }
    return sharp(pixels, { raw: { width: w, height: h, channels: 3 } });
}

// ─── Run ────────────────────────────────────────────────────────

await fs.mkdir("filter-test-output", { recursive: true });

const baseImage = await createTestImage();
const baseBuffer = await baseImage.jpeg().toBuffer();

for (const [id, fn] of Object.entries(FILTERS)) {
    const img = sharp(baseBuffer);
    try {
        const result = await fn(img).jpeg({ quality: 95 }).toBuffer();
        await fs.writeFile(path.join("filter-test-output", `${id}.jpg`), result);
        console.log(`✅ ${id}`);
    } catch (err) {
        console.error(`❌ ${id}:`, err.message);
    }
}

console.log("\nOpen ./filter-test-output/ to compare against browser CSS previews.");
