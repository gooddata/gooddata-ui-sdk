// (C) 2007-2022 GoodData Corporation
/**
 * Copyright (c) 2015 Case Sandberg
 * Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms.
 */
import React, { PureComponent, RefObject, ReactNode, CSSProperties } from "react";
import { ColorFormats } from "tinycolor2";

import { calculateHueChange } from "../utils.js";

export interface IHueColorPickerProps {
    initColor: ColorFormats.HSL;
    onChange: (color: ColorFormats.HSL) => void;
}

export class HueColorPicker extends PureComponent<IHueColorPickerProps> {
    private readonly hueContainer: RefObject<HTMLDivElement>;

    constructor(props: IHueColorPickerProps) {
        super(props);
        this.hueContainer = React.createRef();
    }

    componentWillUnmount(): void {
        this.unbindEventListeners();
    }

    getPointerStyle(): CSSProperties {
        return {
            position: "absolute",
            left: `${(this.props.initColor.h * 100) / 360}%`,
        };
    }

    handleChange = (e: TouchEvent | MouseEvent): void => {
        const change = calculateHueChange(e, this.props.initColor.h, this.hueContainer.current);
        if (change && this.props.onChange) {
            this.props.onChange(change);
        }
    };

    handleTouchChange = (e: React.TouchEvent): void => {
        this.handleChange(e.nativeEvent);
    };

    handleMouseDown = (e: React.MouseEvent): void => {
        this.bindEventListeners();
        this.handleChange(e.nativeEvent);
    };

    handleMouseUp = (): void => {
        this.unbindEventListeners();
    };

    bindEventListeners(): void {
        window.addEventListener("mousemove", this.handleChange);
        window.addEventListener("mouseup", this.handleMouseUp);
    }

    unbindEventListeners(): void {
        window.removeEventListener("mousemove", this.handleChange);
        window.removeEventListener("mouseup", this.handleMouseUp);
    }

    render(): ReactNode {
        return (
            <div
                role="hue-picker"
                className="hue-picker hue-horizontal s-hue-picker"
                ref={this.hueContainer}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}
                onTouchMove={this.handleTouchChange}
                onTouchStart={this.handleTouchChange}
            >
                <div style={this.getPointerStyle()}>
                    <div className="color-picker-pointer s-color-picker-pointer" />
                </div>
            </div>
        );
    }
}
