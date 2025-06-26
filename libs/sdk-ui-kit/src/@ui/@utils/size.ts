// (C) 2025 GoodData Corporation

import { SizeXSmall, SizeSmall, SizeMedium, SizeLarge, SizeXLarge } from "../@types/size.js";

export const getButtonIconSize = (size: SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge) => {
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
        default:
            return 18;
    }
};
