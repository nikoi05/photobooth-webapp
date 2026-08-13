export function applyFilter(image, filterId) {

    switch(filterId){

        // Warm sepia with a soft glow — matches CSS: sepia(0.5) saturate(1.3) brightness(1.08) contrast(0.95)
        case "sandali":
            return image
                .modulate({
                    brightness: 1.08,
                    saturation: 1.3
                })
                .tint("#c8a26a")       // warm parchment tint (approximates sepia(0.5))
                .linear(0.95, 0);      // contrast(0.95)

        // Rich warm gold — matches CSS: sepia(0.7) saturate(1.6) brightness(1.1) contrast(0.9)
        case "golden":
            return image
                .modulate({
                    brightness: 1.1,
                    saturation: 1.6
                })
                .tint("#d4a64c")       // golden tint (approximates sepia(0.7))
                .linear(0.9, 0);       // contrast(0.9)

        // Washed-out analog look — matches CSS: sepia(0.2) contrast(0.8) brightness(1.15) saturate(0.7)
        case "faded":
            return image
                .modulate({
                    brightness: 1.15,
                    saturation: 0.7
                })
                .tint("#d4c9b8")       // very subtle warm cast (approximates sepia(0.2))
                .linear(0.8, 15);      // contrast(0.8) with slight lift

        // Clean black & white — matches CSS: grayscale(1) contrast(1.1) brightness(1.05)
        case "mono":
            return image
                .grayscale()
                .modulate({ brightness: 1.05 })
                .linear(1.1, 0);       // contrast(1.1)

        // High contrast dramatic b&w — matches CSS: grayscale(1) contrast(1.5) brightness(0.88)
        case "noir":
            return image
                .grayscale()
                .modulate({ brightness: 0.88 })
                .linear(1.5, -25);     // contrast(1.5) with dark push

        // Deep warm reddish-brown — matches CSS: sepia(0.6) saturate(1.8) hue-rotate(-10deg) brightness(0.95) contrast(1.05)
        case "terracotta":
            return image
                .modulate({
                    brightness: 0.95,
                    saturation: 1.8,
                    hue: -10           // hue-rotate(-10deg)
                })
                .tint("#8a4b2d")       // terracotta tint (approximates sepia(0.6))
                .linear(1.05, 0);      // contrast(1.05)

        default:
            return image;
    }
}