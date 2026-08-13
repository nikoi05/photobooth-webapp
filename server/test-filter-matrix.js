import sharp from "sharp";

// ─── Matrix helpers ──────────────────────────────────────────────────────────

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

const IDENTITY = [[1,0,0],[0,1,0],[0,0,1]];

// ─── CSS filter matrices (W3C spec) ──────────────────────────────────────────

function mBrightness(a) {
    return [
        [a, 0, 0],
        [0, a, 0],
        [0, 0, a],
    ];
}

function mSaturate(a) {
    const lr = 0.213, lg = 0.715, lb = 0.072;
    return [
        [lr + (1 - lr) * a,  lg - lg * a,         lb - lb * a        ],
        [lr - lr * a,         lg + (1 - lg) * a,   lb - lb * a        ],
        [lr - lr * a,         lg - lg * a,          lb + (1 - lb) * a ],
    ];
}

function mGrayscale(a) {
    const lr = 0.2126, lg = 0.7152, lb = 0.0722;
    const c = 1 - a;
    return [
        [lr + c * (1 - lr),  lg - lg * c,          lb - lb * c        ],
        [lr - lr * c,         lg + c * (1 - lg),    lb - lb * c        ],
        [lr - lr * c,         lg - lg * c,           lb + c * (1 - lb) ],
    ];
}

function mSepia(a) {
    return [
        [1 - a * (1 - 0.393), a * 0.769,            a * 0.189         ],
        [a * 0.349,           1 - a * (1 - 0.686),  a * 0.168         ],
        [a * 0.272,           a * 0.534,             1 - a * (1 - 0.131)],
    ];
}

function mHueRotate(deg) {
    const rad = (deg * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [
        [0.213 + cos * 0.787 - sin * 0.213,  0.715 - cos * 0.715 - sin * 0.715,  0.072 - cos * 0.072 + sin * 0.928],
        [0.213 - cos * 0.213 + sin * 0.143,  0.715 + cos * 0.285 + sin * 0.140,  0.072 - cos * 0.072 - sin * 0.283],
        [0.213 - cos * 0.213 - sin * 0.787,  0.715 - cos * 0.715 + sin * 0.715,  0.072 + cos * 0.928 + sin * 0.072],
    ];
}

// ─── Build each filter chain exactly as defined in frontend ─────────────────

function matrixForFilter(filterId) {
    switch (filterId) {
        case "sandali":
            // sepia(0.5) saturate(1.3) brightness(1.08) contrast(0.95)
            return chain(mSepia(0.5), mSaturate(1.3), mBrightness(1.08));
        case "golden":
            // sepia(0.7) saturate(1.6) brightness(1.1) contrast(0.9)
            return chain(mSepia(0.7), mSaturate(1.6), mBrightness(1.1));
        case "faded":
            // sepia(0.2) contrast(0.8) brightness(1.15) saturate(0.7)
            return chain(mSepia(0.2), mSaturate(0.7), mBrightness(1.15));
        case "mono":
            // grayscale(1) contrast(1.1) brightness(1.05)
            return chain(mGrayscale(1), mBrightness(1.05));
        case "noir":
            // grayscale(1) contrast(1.5) brightness(0.88)
            return chain(mGrayscale(1), mBrightness(0.88));
        case "terracotta":
            // sepia(0.6) saturate(1.8) hue-rotate(-10deg) brightness(0.95) contrast(1.05)
            return chain(mSepia(0.6), mSaturate(1.8), mHueRotate(-10), mBrightness(0.95));
        default:
            return IDENTITY;
    }
}

// ─── Test each matrix ───────────────────────────────────────────────────────

console.log("Testing filter matrices:\n");

["sandali", "golden", "faded", "mono", "noir", "terracotta"].forEach(id => {
    const M = matrixForFilter(id);
    console.log(`${id.toUpperCase()}:`);
    console.log(`  R = [${M[0].map(n => n.toFixed(3)).join(", ")}]`);
    console.log(`  G = [${M[1].map(n => n.toFixed(3)).join(", ")}]`);
    console.log(`  B = [${M[2].map(n => n.toFixed(3)).join(", ")}]`);
    console.log();
});
