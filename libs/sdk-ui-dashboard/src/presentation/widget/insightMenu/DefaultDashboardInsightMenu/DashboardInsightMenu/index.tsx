// (C) 2021 GoodData Corporation
import React from "react";
import cx from "classnames";
import { stringUtils } from "@gooddata/util";

import { IDashboardInsightMenuProps } from "../../types";
import { objRefToString } from "@gooddata/sdk-model";
import { widgetRef } from "@gooddata/sdk-backend-spi";
import { ArrowDirections, ArrowOffsets, Bubble, IAlignPoint, Separator } from "@gooddata/sdk-ui-kit";
import { DashboardInsightMenuContainer } from "./DashboardInsightMenuContainer";
import { DashboardInsightMenuItemButton } from "./DashboardInsightMenuItemButton";

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

export const DashboardInsightMenu: React.FC<IDashboardInsightMenuProps> = (props) => {
    const { items, widget, onClose } = props;
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
            <DashboardInsightMenuContainer onClose={onClose} widget={widget}>
                {items.map((item) => {
                    if (item.type === "separator") {
                        return <Separator key={item.itemId} />;
                    }

                    return <DashboardInsightMenuItemButton key={item.itemId} {...item} />;
                })}
            </DashboardInsightMenuContainer>
        </Bubble>
    );
};
