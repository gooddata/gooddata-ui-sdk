// (C) 2025 GoodData Corporation

import { SizeLarge, SizeMedium, SizeSmall, SizeXLarge, SizeXSmall, SizeXXLarge } from "../@types/size.js";

export const getButtonIconSize = (
    size: SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge | SizeXXLarge,
) => {
    switch (size) {
        case "xsmall":
            return 12;
        case "small":
            return 16;
        case "medium":
            return 18;
        case "large":
            return 20;
        case "xlarge":
            return 30;
        case "xxlarge":
            return 30;
        default:
            return 18;
    }
};
