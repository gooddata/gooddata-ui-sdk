// (C) 2020-2022 GoodData Corporation
import React from "react";
import keys from "lodash/keys.js";
import cloneDeep from "lodash/cloneDeep.js";
import isEqual from "lodash/isEqual.js";
import isReactEqual from "react-fast-compare";
import result from "lodash/result.js";
import noop from "lodash/noop.js";
import cx from "classnames";

import { IAlignPoint } from "../typings/positioning.js";
import { ArrowDirections, ArrowOffsets } from "./typings.js";
import { Overlay } from "../Overlay/index.js";

const ARROW_DIRECTIONS: ArrowDirections = {
    ".. cc": "none",

    ".r .l|.. cl": "left",
    ".l .r|.. cr": "right",

    ".. t.": "top",
    ".. b.": "bottom",

    ".. .l": "left",
    ".. .r": "right",
};

// FIXME: hardcoded offsets for Indigo style
export const X_SHIFT = 7;
export const Y_SHIFT = 11;

// FIXME: constants are bad, we know :(
const ARROW_OFFSETS: ArrowOffsets = {
    ".. cc": [0, 0],

    ".. tc": [0, X_SHIFT],
    ".. bc": [0, -X_SHIFT],

    ".. cl": [X_SHIFT, 0],
    ".. cr": [-X_SHIFT, 0],

    ".r tl": [X_SHIFT, -Y_SHIFT],
    ".l tr": [-X_SHIFT, -Y_SHIFT],

    ".r bl": [X_SHIFT, Y_SHIFT],
    ".l br": [-X_SHIFT, Y_SHIFT],

    ".. tl": [-Y_SHIFT, X_SHIFT],
    ".. tr": [Y_SHIFT, X_SHIFT],
    ".. bl": [-Y_SHIFT, -X_SHIFT],
    ".. br": [Y_SHIFT, -X_SHIFT],
};

/**
 * @internal
 */
export interface IBubbleProps {
    alignPoints?: IAlignPoint[];
    alignTo?: string;
    arrowOffsets?: ArrowOffsets;
    arrowDirections?: ArrowDirections;
    arrowStyle?: React.CSSProperties;
    className?: string;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;

    /**
     * Array of refs where user clicks should be ignored
     * and bubble should not be closed by clicking on them
     */
    ignoreClicksOn?: any[];
    ignoreClicksOnByClass?: string[];
    onClose?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
    onKeyDown?: () => void;
    overlayClassName?: string;
    children?: React.ReactNode;
}

/**
 * @internal
 */
export interface IBubbleState {
    alignPoints: IAlignPoint[];
    optimalAlignPoints: string;
}

/**
 * @internal
 */
export class Bubble extends React.Component<IBubbleProps, IBubbleState> {
    static defaultProps = {
        alignPoints: [
            {
                align: "bl tl",
            },
        ],
        alignTo: "body",
        arrowOffsets: {},
        arrowDirections: {},
        arrowStyle: {},
        className: "bubble-primary",
        closeOnOutsideClick: false,
        closeOnParentScroll: true,
        onClose: noop,
        onMouseEnter: noop,
        onMouseLeave: noop,
        overlayClassName: "",
    };

    // identifier for BubbleTrigger
    static identifier = "Bubble";
    arrowOffsets: ArrowOffsets;
    arrowDirections: ArrowDirections;

    constructor(props: IBubbleProps) {
        super(props);

        this.arrowOffsets = { ...props.arrowOffsets, ...ARROW_OFFSETS };
        this.arrowDirections = { ...props.arrowDirections, ...ARROW_DIRECTIONS };

        const alignPoints = this.addOffsetToAlignPoints(cloneDeep(props.alignPoints));

        this.state = {
            alignPoints,
            optimalAlignPoints: props.alignPoints[0].align,
        };
    }

    shouldComponentUpdate(nextProps: IBubbleProps, nextState: IBubbleState): boolean {
        const propsChanged = !isReactEqual(this.props, nextProps);
        const alignmentChanged = !isEqual(this.state.optimalAlignPoints, nextState.optimalAlignPoints);

        return propsChanged || alignmentChanged;
    }

    onAlign = (alignment: IAlignPoint): void => {
        this.setState({ optimalAlignPoints: alignment.align });
    };

    getClassnames(): string {
        return cx({
            [this.props.className]: !!this.props.className,
            [this.getArrowsClassname(this.state.optimalAlignPoints)]: true,
            "gd-bubble": true,
            bubble: true,
        });
    }

    getArrowsClassname(alignPoints: string): string {
        const myAlignPoint = alignPoints.split(" ")[1];
        const direction = this.getArrowDirection(alignPoints);

        return `arrow-${direction}-direction arrow-${myAlignPoint}`;
    }

    getArrowDirection(alignPoints: string): string {
        const key = keys(this.arrowDirections).find((arrowDirection) => alignPoints.match(arrowDirection));

        return this.arrowDirections[key] || "none";
    }

    addOffsetToAlignPoints(alignPoints: IAlignPoint[]): IAlignPoint[] {
        const { arrowOffsets } = this;
        const arrowOffsetsKeys = keys(arrowOffsets);
        const getKey = (align: string, re: string) => {
            return align.match(re) !== null;
        };

        return alignPoints.map((item) => {
            const key = arrowOffsetsKeys.find(getKey.bind(this, item.align));

            item.offset = item.offset || { x: 0, y: 0 };
            item.offset.x += arrowOffsets[key][0];
            item.offset.y += arrowOffsets[key][1];

            return item;
        }, this);
    }

    render() {
        const arrowStyle = result(this.props, "arrowStyle", {});

        return (
            <Overlay
                className={this.props.overlayClassName}
                alignTo={this.props.alignTo}
                onAlign={this.onAlign}
                alignPoints={this.state.alignPoints}
                closeOnParentScroll={this.props.closeOnParentScroll}
                closeOnMouseDrag
                closeOnOutsideClick={this.props.closeOnOutsideClick}
                ignoreClicksOn={this.props.ignoreClicksOn}
                ignoreClicksOnByClass={this.props.ignoreClicksOnByClass}
                onClose={this.props.onClose}
            >
                <div
                    onMouseEnter={this.props.onMouseEnter}
                    onMouseLeave={this.props.onMouseLeave}
                    onKeyDown={this.props.onKeyDown}
                    className={this.getClassnames()}
                >
                    <div className="bubble-content">
                        <div className="helper" />
                        <div className="arrow-position" style={arrowStyle}>
                            <div className="arrow-border" />
                            <div className="arrow" />
                        </div>
                        <div className="content">{this.props.children}</div>
                    </div>
                </div>
            </Overlay>
        );
    }
}
