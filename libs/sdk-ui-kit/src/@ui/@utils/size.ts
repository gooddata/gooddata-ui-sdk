// (C) 2025 GoodData Corporation

import { SizeXSmall, SizeSmall, SizeMedium, SizeLarge } from "../@types/size.js";

export const getButtonIconSize = (size: SizeXSmall | SizeSmall | SizeMedium | SizeLarge) => {
    switch (size) {
        case "xsmall":
            return 12;
        case "small":
            return 16;
        case "medium":
            return 18;
        case "large":
            return 20;
        default:
            return 18;
    }
};
