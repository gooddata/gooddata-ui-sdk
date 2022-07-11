// (C) 2019-2022 GoodData Corporation
import React from "react";
import { Overlay } from "@gooddata/sdk-ui-kit";

export enum DropdownVersionType {
    ColorPalette,
    ColorPicker,
}

export interface IColorOverlayProps {
    alignTo: string;
    dropdownVersion: DropdownVersionType;
    onClose: () => void;
}

const ALIGN_POINTS_COLOR_PALETTE_PICKER = [
    {
        align: "bl tl",
        offset: {
            x: 0,
            y: 2,
        },
    },
    {
        align: "tl bl",
        offset: {
            x: 0,
            y: 2,
        },
    },
];

const ALIGN_POINTS_CUSTOM_COLOR_PICKER = [
    {
        align: "cr cl",
        offset: {
            x: 5,
            y: 0,
        },
    },
    {
        align: "br bl",
        offset: {
            x: 5,
            y: 100,
        },
    },
    {
        align: "br bl",
        offset: {
            x: 5,
            y: 0,
        },
    },
];

export default class ColorOverlay extends React.PureComponent<IColorOverlayProps> {
    public componentWillUnmount(): void {
        this.startScrollingPropagation();
    }

    public render() {
        return (
            <Overlay
                alignTo={this.props.alignTo}
                onClose={this.onClose}
                alignPoints={this.getAlignPoints()}
                closeOnOutsideClick={true}
                closeOnParentScroll={true}
                closeOnMouseDrag={true}
            >
                <div onMouseOver={this.stopScrollingPropagation} onMouseOut={this.startScrollingPropagation}>
                    {this.props.children}
                </div>
            </Overlay>
        );
    }

    private stopScrollingPropagation = () => {
        document.body.addEventListener("wheel", this.stopPropagation);
    };

    private startScrollingPropagation = () => {
        document.body.removeEventListener("wheel", this.stopPropagation);
    };

    private stopPropagation = (e: WheelEvent) => {
        e.stopPropagation();
    };

    private getAlignPoints() {
        if (this.props.dropdownVersion === DropdownVersionType.ColorPalette) {
            return ALIGN_POINTS_COLOR_PALETTE_PICKER;
        }

        return ALIGN_POINTS_CUSTOM_COLOR_PICKER;
    }

    private onClose = () => {
        this.props.onClose();
    };
}
