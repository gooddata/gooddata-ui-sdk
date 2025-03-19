// (C) 2021-2024 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";
import { IWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

import { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "../../../../constants/index.js";

const alignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "tr tr" },
    { align: "br br" },
];

const arrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

const arrowOffsets: ArrowOffsets = {
    "tr tl": [20, 0],
    "tl tr": [-20, 0],
};

interface IDashboardInsightMenuBubbleProps {
    widget: IWidget;
    onClose: () => void;
    isSubmenu?: boolean;
    children?: React.ReactNode;
}

export const DashboardInsightMenuBubble: React.FC<IDashboardInsightMenuBubbleProps> = (props) => {
    const { onClose, isSubmenu, widget, children } = props;
    const widgetRefAsString = objRefToString(widgetRef(widget));

    return (
        <Bubble
            alignTo={`.dash-item-action-widget-options-${stringUtils.simplifyText(widgetRefAsString)}`}
            alignPoints={alignPoints}
            arrowDirections={arrowDirections}
            arrowOffsets={arrowOffsets}
            className={cx(
                "bubble-light",
                "gd-configuration-bubble",
                "edit-insight-config",
                "s-edit-insight-config",
                "edit-insight-config-title-1-line",
                isSubmenu ? "edit-insight-config-arrow-submenu-color" : "edit-insight-config-arrow-color",
            )}
            closeOnOutsideClick
            onClose={onClose}
            overlayClassName="gd-configuration-bubble-wrapper sdk-edit-mode-on"
            ignoreClicksOnByClass={[`.${IGNORED_CONFIGURATION_MENU_CLICK_CLASS}`]}
        >
            {children}
        </Bubble>
    );
};
