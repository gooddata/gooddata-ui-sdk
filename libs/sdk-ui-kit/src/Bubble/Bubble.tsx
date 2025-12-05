// (C) 2020-2025 GoodData Corporation

import { CSSProperties, ReactNode, memo, useCallback, useMemo, useState } from "react";

import cx from "classnames";
import { cloneDeep, result } from "lodash-es";
import isReactEqual from "react-fast-compare";

import { ArrowDirections, ArrowOffsets } from "./typings.js";
import { ZoomAwareOverlay } from "../Overlay/index.js";
import { OverlayPositionType } from "../typings/overlay.js";
import { IAlignPoint } from "../typings/positioning.js";

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
export interface IBubbleAccessibilityConfig {
    role?: string;
    ariaLabelledBy?: string;
}

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
    accessibilityConfig?: IBubbleAccessibilityConfig;
}

/**
 * @internal
 */
export interface IBubbleState {
    alignPoints: IAlignPoint[];
    optimalAlignPoints: string;
}

const defaultProps = {
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
    closeOnEscape: false,
    onClose: () => {},
    onMouseEnter: () => {},
    onMouseLeave: () => {},
    overlayClassName: "",
};

/**
 * @internal
 */
export const Bubble = memo(
    function Bubble(props: IBubbleProps) {
        const {
            id,
            alignPoints: alignPointsProp,
            alignTo,
            arrowOffsets: arrowOffsetsProp,
            arrowDirections: arrowDirectionsProp,
            arrowStyle: arrowStyleProp,
            className,
            closeOnOutsideClick,
            closeOnParentScroll,
            closeOnEscape,
            ignoreClicksOn,
            ignoreClicksOnByClass,
            onClose,
            onMouseEnter,
            onMouseLeave,
            onKeyDown,
            overlayClassName,
            children,
            overlayPositionType,
            ensureVisibility,
            accessibilityConfig,
        } = { ...defaultProps, ...props };

        const { role, ariaLabelledBy } = accessibilityConfig ?? {};

        const arrowOffsets = useMemo(
            (): ArrowOffsets => ({
                ...arrowOffsetsProp,
                ...ARROW_OFFSETS,
            }),
            [arrowOffsetsProp],
        );

        const arrowDirections = useMemo(
            (): ArrowDirections => ({
                ...arrowDirectionsProp,
                ...ARROW_DIRECTIONS,
            }),
            [arrowDirectionsProp],
        );

        const addOffsetToAlignPoints = useCallback(
            (alignPoints: IAlignPoint[]): IAlignPoint[] => {
                const arrowOffsetsKeys = Object.keys(arrowOffsets);
                const getKey = (align: string, re: string) => {
                    return align.match(re) !== null;
                };

                return alignPoints.map((item) => {
                    const key = arrowOffsetsKeys.find(getKey.bind(null, item.align));
                    const existingOffset = item.offset || { x: 0, y: 0 };
                    const arrowOffset = key ? arrowOffsets[key] : [0, 0];

                    return {
                        ...item,
                        offset: {
                            x: (existingOffset.x ?? 0) + arrowOffset[0],
                            y: (existingOffset.y ?? 0) + arrowOffset[1],
                        },
                    };
                });
            },
            [arrowOffsets],
        );

        const initialAlignPoints = useMemo(
            () => addOffsetToAlignPoints(cloneDeep(alignPointsProp)),
            [addOffsetToAlignPoints, alignPointsProp],
        );

        const [alignPoints] = useState(initialAlignPoints);
        const [optimalAlignPoints, setOptimalAlignPoints] = useState(alignPointsProp[0].align);

        const onAlign = useCallback((alignment: IAlignPoint): void => {
            setOptimalAlignPoints(alignment.align);
        }, []);

        const getArrowDirection = useCallback(
            (alignPoints: string): string => {
                const key = Object.keys(arrowDirections).find((arrowDirection) =>
                    alignPoints.match(arrowDirection),
                );
                return (key ? arrowDirections[key] : undefined) || "none";
            },
            [arrowDirections],
        );

        const getArrowsClassname = useCallback(
            (alignPoints: string): string => {
                const myAlignPoint = alignPoints.split(" ")[1];
                const direction = getArrowDirection(alignPoints);

                return `arrow-${direction}-direction arrow-${myAlignPoint}`;
            },
            [getArrowDirection],
        );

        const classNames = useMemo(() => {
            return cx({
                [className]: !!className,
                [getArrowsClassname(optimalAlignPoints)]: true,
                "gd-bubble": true,
                bubble: true,
            });
        }, [className, getArrowsClassname, optimalAlignPoints]);

        const arrowStyle = useMemo(
            () => result({ arrowStyle: arrowStyleProp }, "arrowStyle", {}),
            [arrowStyleProp],
        );

        return (
            <ZoomAwareOverlay
                id={id}
                className={overlayClassName}
                alignTo={alignTo}
                onAlign={onAlign}
                alignPoints={alignPoints}
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
                    className={classNames}
                    role={role}
                    aria-labelledby={ariaLabelledBy}
                >
                    <div className="bubble-content">
                        <div className="helper" />
                        <div className="arrow-position" style={arrowStyle}>
                            <div className="arrow-border" />
                            <div className="arrow" />
                        </div>
                        <div className="content">{children}</div>
                    </div>
                </div>
            </ZoomAwareOverlay>
        );
    },
    (prevProps, nextProps) => {
        return isReactEqual(prevProps, nextProps);
    },
);

// identifier for BubbleTrigger
(Bubble as any).identifier = "Bubble";
