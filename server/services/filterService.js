export function applyFilter(image, filterId) {

    switch(filterId){

        case "sandali":
            return image
                .modulate({
                    brightness: 1.08,
                    saturation: 1.3
                })
                .tint("#c8a26a");

        case "golden":
            return image
                .modulate({
                    brightness: 1.1,
                    saturation: 1.6
                })
                .tint("#d4a64c");

        case "faded":
            return image
                .modulate({
                    brightness: 1.15,
                    saturation: 0.7
                })
                .linear(0.8, 15);

        case "mono":
            return image
                .grayscale()
                .linear(1.1);

        case "noir":
            return image
                .grayscale()
                .linear(1.5, -25);

        case "terracotta":
            return image
                .modulate({
                    brightness: 0.95,
                    saturation: 1.8
                })
                .tint("#8a4b2d");

        default:
            return image;
    }
}