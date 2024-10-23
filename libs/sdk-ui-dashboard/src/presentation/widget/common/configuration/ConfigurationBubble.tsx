// (C) 2022-2024 GoodData Corporation
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

export const defaultArrowOffsets: ArrowOffsets = {
    "tr tl": [7, 28],
    "br bl": [7, -28],
    "tl tr": [-7, 28],
    "tr tr": [-76, 28],
    "br br": [-76, -28],
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
        arrowOffsets = defaultArrowOffsets,
        overlayPositionType,
        arrowDirections = defaultArrowDirections,
    } = props;
    const ignoreClicksOnByClass = [alignTo, `.${IGNORED_CONFIGURATION_MENU_CLICK_CLASS}`]; // do not close on click to the widget

    return (
        <Bubble
            className={cx("bubble-light gd-configuration-bubble s-gd-configuration-bubble", classNames)}
            overlayClassName="gd-configuration-bubble-wrapper sdk-edit-mode-on"
            alignTo={alignTo}
            alignPoints={alignPoints}
            arrowOffsets={arrowOffsets}
            arrowDirections={arrowDirections}
            closeOnOutsideClick
            closeOnParentScroll={false}
            ignoreClicksOnByClass={ignoreClicksOnByClass}
            onClose={onClose}
            overlayPositionType={overlayPositionType}
        >
            {children}
        </Bubble>
    );
};
