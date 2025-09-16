// (C) 2021-2025 GoodData Corporation

import { ReactNode } from "react";

import cx from "classnames";

import { IWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { IGNORED_CONFIGURATION_MENU_CLICK_CLASS } from "../../../../constants/index.js";

const alignPoints: IAlignPoint[] = [
    { align: "tr tl" },
    { align: "br bl" },
    { align: "tl tr" },
    { align: "bl br" },
    { align: "tr tr" },
    { align: "br br" },
];

const arrowDirections: ArrowDirections = {
    "tr tr": "right",
    "br br": "right",
};

const flexibleArrowOffsets: ArrowOffsets = {
    "tr tl": [16, -2],
    "br bl": [16, 27],
    "tl tr": [-16, -2],
    "bl br": [-16, 27],
};

interface IDashboardInsightMenuBubbleProps {
    widget: IWidget;
    onClose: () => void;
    isSubmenu?: boolean;
    children?: ReactNode;
}

export function DashboardInsightMenuBubble(props: IDashboardInsightMenuBubbleProps) {
    const { onClose, isSubmenu, widget, children } = props;
    const widgetRefAsString = objRefToString(widgetRef(widget));

    return (
        <Bubble
            alignTo={`.dash-item-action-widget-options-${stringUtils.simplifyText(widgetRefAsString)}`}
            alignPoints={alignPoints}
            arrowDirections={arrowDirections}
            arrowOffsets={flexibleArrowOffsets}
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
}
