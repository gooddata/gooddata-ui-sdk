// (C) 2022-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import {
    ArrowDirections,
    ArrowOffsets,
    Bubble,
    IAlignPoint,
    OverlayPositionType,
} from "@gooddata/sdk-ui-kit";

import { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "../../../constants/index.js";
import { useDashboardSelector, selectEnableFlexibleLayout } from "../../../../model/index.js";

interface IConfigurationBubbleProps {
    classNames?: string;
    onClose?: () => void;
    children?: React.ReactNode;
    alignTo?: string;
    alignPoints?: IAlignPoint[];
    arrowOffsets?: ArrowOffsets;
    overlayPositionType?: OverlayPositionType;
    arrowDirections?: ArrowDirections;
}

export const defaultAlignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "tr tr" },
    { align: "br br" },
];

export const defaultFluidArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 28],
    "br bl": [7, -28],
    "tl tr": [-7, 28],
    "tr tr": [-76, 28],
    "br br": [-76, -28],
};

export const defaultFlexibleArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 8],
    "br bl": [7, -8],
    "tl tr": [-7, 8],
    "tr tr": [-76, 8],
    "br br": [-76, -8],
};

export const defaultArrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

export const ConfigurationBubble: React.FC<IConfigurationBubbleProps> = (props) => {
    const {
        children,
        classNames,
        onClose,
        alignTo = ".s-dash-item.is-selected",
        alignPoints = defaultAlignPoints,
        arrowOffsets,
        overlayPositionType,
        arrowDirections = defaultArrowDirections,
    } = props;
    const ignoreClicksOnByClass = [alignTo, `.${IGNORED_CONFIGURATION_MENU_CLICK_CLASS}`]; // do not close on click to the widget

    const isFlexibleLayoutEnabled = useDashboardSelector(selectEnableFlexibleLayout);
    const bubbleArrowOffsets =
        arrowOffsets === undefined
            ? isFlexibleLayoutEnabled
                ? defaultFlexibleArrowOffsets
                : defaultFluidArrowOffsets
            : arrowOffsets;

    return (
        <Bubble
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
            overlayPositionType={overlayPositionType}
            ensureVisibility={true}
        >
            {children}
        </Bubble>
    );
};
