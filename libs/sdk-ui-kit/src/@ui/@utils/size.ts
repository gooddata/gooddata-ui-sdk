// (C) 2025-2026 GoodData Corporation

import {
    type SizeLarge,
    type SizeMedium,
    type SizeSmall,
    type SizeXLarge,
    type SizeXSmall,
    type SizeXXLarge,
    type SizeXXSmall,
} from "../@types/size.js";

export const getButtonIconSize = (
    size: SizeXXSmall | SizeXSmall | SizeSmall | SizeMedium | SizeLarge | SizeXLarge | SizeXXLarge,
) => {
    switch (size) {
        case "xxsmall":
            return 12;
        case "xsmall":
            return 14;
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
