// (C) 2007-2022 GoodData Corporation
import React, { PureComponent, ReactNode } from "react";
import { ColorFormats } from "tinycolor2";

import { getColorStyle } from "../utils.js";

export interface IColorsPreviewProps {
    currentHslColor: ColorFormats.HSL;
    draftHslColor: ColorFormats.HSL;
    currentTextLabel?: string;
    draftTextLabel?: string;
}

export class ColorsPreview extends PureComponent<IColorsPreviewProps> {
    static defaultProps: Pick<IColorsPreviewProps, "currentTextLabel" | "draftTextLabel"> = {
        currentTextLabel: "current",
        draftTextLabel: "new",
    };

    render(): ReactNode {
        return (
            <div className="color-picker-preview">
                <ColorItem
                    id="current-color"
                    hslColor={this.props.currentHslColor}
                    textLabel={this.props.currentTextLabel}
                />
                <ColorItem
                    id="new-color"
                    hslColor={this.props.draftHslColor}
                    textLabel={this.props.draftTextLabel}
                />
            </div>
        );
    }
}

interface IColorItemProps {
    id: string;
    hslColor: ColorFormats.HSL;
    textLabel: string;
}

class ColorItem extends PureComponent<IColorItemProps> {
    render(): ReactNode {
        return (
            <div className="color-picker-value-wrapper">
                <div
                    aria-label={this.props.id}
                    className={`color-value s-${this.props.id}`}
                    style={getColorStyle(this.props.hslColor)}
                />
                <span>{this.props.textLabel}</span>
            </div>
        );
    }
}
