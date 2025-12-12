// (C) 2022-2025 GoodData Corporation

import { type ReactNode } from "react";

import cx from "classnames";

import {
    type ArrowDirections,
    type ArrowOffsets,
    Bubble,
    type IAlignPoint,
    type IBubbleAccessibilityConfig,
    type OverlayPositionType,
} from "@gooddata/sdk-ui-kit";

import { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "../../../constants/index.js";

interface IConfigurationBubbleProps {
    id?: string;
    classNames?: string;
    onClose?: () => void;
    closeOnEscape?: boolean;
    children?: ReactNode;
    alignTo: string | HTMLElement | null;
    alignPoints?: IAlignPoint[];
    arrowOffsets?: ArrowOffsets;
    overlayPositionType?: OverlayPositionType;
    arrowDirections?: ArrowDirections;
    accessibilityConfig?: IBubbleAccessibilityConfig;
}

export const defaultAlignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "bl br" },
    { align: "tr tr" },
    { align: "br br" },
];

export const defaultFlexibleArrowOffsets: ArrowOffsets = {
    "tr tl": [15, 16],
    "br bl": [15, -16],
    "tl tr": [-15, 16],
    "bl br": [-15, -16],
};

export const defaultArrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

export function ConfigurationBubble({
    id,
    children,
    classNames,
    onClose,
    closeOnEscape,
    alignTo,
    alignPoints = defaultAlignPoints,
    arrowOffsets,
    overlayPositionType,
    arrowDirections = defaultArrowDirections,
    accessibilityConfig,
}: IConfigurationBubbleProps) {
    // do not close on click to the widget
    const ignoredClassSelector = `.${IGNORED_CONFIGURATION_MENU_CLICK_CLASS}`;
    const ignoreClicksOnByClass =
        typeof alignTo === "string" ? [alignTo, ignoredClassSelector] : [ignoredClassSelector];

    const bubbleArrowOffsets = arrowOffsets === undefined ? defaultFlexibleArrowOffsets : arrowOffsets;

    return (
        <Bubble
            id={id}
            className={cx("bubble-light gd-configuration-bubble s-gd-configuration-bubble", classNames)}
            overlayClassName="gd-configuration-bubble-wrapper sdk-edit-mode-on"
            alignTo={alignTo}
            alignPoints={alignPoints}
            arrowOffsets={bubbleArrowOffsets}
            arrowDirections={arrowDirections}
            closeOnOutsideClick
            closeOnParentScroll={false}
            ignoreClicksOnByClass={ignoreClicksOnByClass}
            onClose={onClose}
            closeOnEscape={closeOnEscape}
            overlayPositionType={overlayPositionType}
            ensureVisibility
            accessibilityConfig={accessibilityConfig}
        >
            {children}
        </Bubble>
    );
}
