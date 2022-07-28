// (C) 2021-2022 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { IWidget, objRefToString, widgetRef } from "@gooddata/sdk-model";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint } from "@gooddata/sdk-ui-kit";

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
}

export const DashboardInsightMenuBubble: React.FC<IDashboardInsightMenuBubbleProps> = (props) => {
    const { onClose, widget, children } = props;
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
                "edit-insight-config-arrow-color",
                "edit-insight-config-title-1-line",
            )}
            closeOnOutsideClick
            onClose={onClose}
            overlayClassName="gd-configuration-bubble-wrapper"
        >
            {children}
        </Bubble>
    );
};
