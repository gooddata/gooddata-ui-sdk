// (C) 2020-2025 GoodData Corporation
import { CSSProperties, ReactNode, useState, useCallback, useMemo, memo, useEffect } from "react";
import keys from "lodash/keys.js";
import cloneDeep from "lodash/cloneDeep.js";
import isReactEqual from "react-fast-compare";
import result from "lodash/result.js";
import noop from "lodash/noop.js";
import cx from "classnames";

import { IAlignPoint } from "../typings/positioning.js";
import { ArrowDirections, ArrowOffsets } from "./typings.js";
import { ZoomAwareOverlay } from "../Overlay/index.js";
import { OverlayPositionType } from "../typings/overlay.js";

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

// FIXME: constants are bad, we know
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
    id?: string;
    alignPoints?: IAlignPoint[];
    alignTo?: string | HTMLElement | null;
    arrowOffsets?: ArrowOffsets;
    arrowDirections?: ArrowDirections;
    arrowStyle?: CSSProperties;
    className?: string;
    closeOnOutsideClick?: boolean;
    closeOnParentScroll?: boolean;
    closeOnEscape?: boolean;

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
    children?: ReactNode;
    overlayPositionType?: OverlayPositionType;
    ensureVisibility?: boolean;
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
export const Bubble = memo(
    function BubbleComponent({
        id,
        alignPoints = [{ align: "bl tl" }],
        alignTo = "body",
        arrowOffsets = {},
        arrowDirections = {},
        arrowStyle = {},
        className = "bubble-primary",
        closeOnOutsideClick = false,
        closeOnParentScroll = true,
        closeOnEscape = false,
        ignoreClicksOn,
        ignoreClicksOnByClass,
        onClose = noop,
        onMouseEnter = noop,
        onMouseLeave = noop,
        onKeyDown,
        overlayClassName = "",
        children,
        overlayPositionType,
        ensureVisibility,
    }: IBubbleProps) {
        const mergedArrowOffsets = useMemo(() => ({ ...arrowOffsets, ...ARROW_OFFSETS }), [arrowOffsets]);
        const mergedArrowDirections = useMemo(
            () => ({ ...arrowDirections, ...ARROW_DIRECTIONS }),
            [arrowDirections],
        );

        const addOffsetToAlignPoints = useCallback(
            (alignPointsToOffset: IAlignPoint[]): IAlignPoint[] => {
                const arrowOffsetsKeys = keys(mergedArrowOffsets);
                const getKey = (align: string, re: string) => {
                    return align.match(re) !== null;
                };

                return alignPointsToOffset.map((item) => {
                    const key = arrowOffsetsKeys.find(getKey.bind(null, item.align));

                    item.offset = item.offset || { x: 0, y: 0 };
                    item.offset.x += mergedArrowOffsets[key][0];
                    item.offset.y += mergedArrowOffsets[key][1];

                    return item;
                });
            },
            [mergedArrowOffsets],
        );

        const initialAlignPoints = useMemo(
            () => addOffsetToAlignPoints(cloneDeep(alignPoints)),
            [alignPoints, addOffsetToAlignPoints],
        );

        const [stateAlignPoints, setAlignPoints] = useState<IAlignPoint[]>(initialAlignPoints);
        const [optimalAlignPoints, setOptimalAlignPoints] = useState<string>(alignPoints[0].align);

        const onAlign = useCallback((alignment: IAlignPoint): void => {
            setOptimalAlignPoints(alignment.align);
        }, []);

        const getArrowDirection = useCallback(
            (alignPointsString: string): string => {
                const key = keys(mergedArrowDirections).find((arrowDirection) =>
                    alignPointsString.match(arrowDirection),
                );

                return mergedArrowDirections[key] || "none";
            },
            [mergedArrowDirections],
        );

        const getArrowsClassname = useCallback(
            (alignPointsString: string): string => {
                const myAlignPoint = alignPointsString.split(" ")[1];
                const direction = getArrowDirection(alignPointsString);

                return `arrow-${direction}-direction arrow-${myAlignPoint}`;
            },
            [getArrowDirection],
        );

        const getClassnames = useCallback((): string => {
            return cx({
                [className]: !!className,
                [getArrowsClassname(optimalAlignPoints)]: true,
                "gd-bubble": true,
                bubble: true,
            });
        }, [className, getArrowsClassname, optimalAlignPoints]);

        // Update alignPoints when props change
        const updatedAlignPoints = useMemo(
            () => addOffsetToAlignPoints(cloneDeep(alignPoints)),
            [alignPoints, addOffsetToAlignPoints],
        );

        // Update state when alignPoints change
        useEffect(() => {
            setAlignPoints(updatedAlignPoints);
        }, [updatedAlignPoints]);

        const resolvedArrowStyle = result({ arrowStyle }, "arrowStyle", {});

        return (
            <ZoomAwareOverlay
                id={id}
                className={overlayClassName}
                alignTo={alignTo}
                onAlign={onAlign}
                alignPoints={stateAlignPoints}
                closeOnParentScroll={closeOnParentScroll}
                closeOnMouseDrag
                closeOnOutsideClick={closeOnOutsideClick}
                ignoreClicksOn={ignoreClicksOn}
                ignoreClicksOnByClass={ignoreClicksOnByClass}
                onClose={onClose}
                closeOnEscape={closeOnEscape}
                positionType={overlayPositionType}
                ensureVisibility={ensureVisibility}
            >
                <div
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onKeyDown={onKeyDown}
                    className={getClassnames()}
                >
                    <div className="bubble-content">
                        <div className="helper" />
                        <div className="arrow-position" style={resolvedArrowStyle}>
                            <div className="arrow-border" />
                            <div className="arrow" />
                        </div>
                        <div className="content">{children}</div>
                    </div>
                </div>
            </ZoomAwareOverlay>
        );
    },
    (prevProps: IBubbleProps, nextProps: IBubbleProps) => {
        // Custom comparison function for memo to replicate shouldComponentUpdate behavior
        return isReactEqual(prevProps, nextProps);
    },
);
