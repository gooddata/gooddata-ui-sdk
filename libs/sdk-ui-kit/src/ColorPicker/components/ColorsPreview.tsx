// (C) 2007-2025 GoodData Corporation
import { ReactNode, memo } from "react";
import { ColorFormats } from "tinycolor2";

import { getColorStyle } from "../utils.js";

export interface IColorsPreviewProps {
    currentHslColor: ColorFormats.HSL;
    draftHslColor: ColorFormats.HSL;
    currentTextLabel?: string;
    draftTextLabel?: string;
}

export const ColorsPreview = memo(function ColorsPreview({
    currentHslColor,
    draftHslColor,
    currentTextLabel = "current",
    draftTextLabel = "new",
}: IColorsPreviewProps): ReactNode {
    return (
        <div className="color-picker-preview">
            <ColorItem id="current-color" hslColor={currentHslColor} textLabel={currentTextLabel} />
            <ColorItem id="new-color" hslColor={draftHslColor} textLabel={draftTextLabel} />
        </div>
    );
});

interface IColorItemProps {
    id: string;
    hslColor: ColorFormats.HSL;
    textLabel: string;
}

const ColorItem = memo(function ColorItem({ id, hslColor, textLabel }: IColorItemProps): ReactNode {
    return (
        <div className="color-picker-value-wrapper">
            <div aria-label={id} className={`color-value s-${id}`} style={getColorStyle(hslColor)} />
            <span>{textLabel}</span>
        </div>
    );
});
