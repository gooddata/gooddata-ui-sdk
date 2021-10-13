// (C) 2020-2021 GoodData Corporation
import React from "react";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, IAlignPoint, Item } from "@gooddata/sdk-ui-kit";
import { IInsightMenuItemButton } from "../../types";

const tooltipAlignPoints: IAlignPoint[] = [{ align: "cl cr" }];

function getCssClassByType(itemId: string) {
    const itemIdFormatted = itemId.toLowerCase();

    const isExportCsv = itemIdFormatted.indexOf("export") > -1 && itemIdFormatted.indexOf("csv") > -1;
    const isExportXlsx = itemIdFormatted.indexOf("export") > -1 && itemIdFormatted.indexOf("xlsx") > -1;
    const isExplore = itemIdFormatted.indexOf("explore") > -1;

    return cx({
        "s-options-menu-explore-insight": isExplore,
        "s-options-menu-export-csv": isExportCsv,
        "s-options-menu-export-xlsx": isExportXlsx,
    });
}

export const DashboardInsightMenuItemButton: React.FC<Omit<IInsightMenuItemButton, "type">> = (props) => {
    const { itemId, itemName, disabled, icon, onClick, tooltip } = props;
    const contentComponent = (
        // for JSX icons we need an extra gd-icon-wrapper class to align the icon and the text vertically
        <span className={cx({ "gd-icon-wrapper": icon && typeof icon !== "string" })}>
            {icon ? typeof icon === "string" ? <i className={icon} /> : icon : null}
            {itemName}
        </span>
    );

    if (disabled) {
        const button = (
            <Item className={getCssClassByType(itemId)} disabled={disabled}>
                {contentComponent}
            </Item>
        );

        if (tooltip) {
            return (
                <BubbleHoverTrigger className="s-gd-bubble-trigger-options-menu-item">
                    {button}
                    <Bubble
                        className={`bubble-primary bubble-primary-${itemId} s-bubble-primary-${itemId}`}
                        alignPoints={tooltipAlignPoints}
                    >
                        {tooltip}
                    </Bubble>
                </BubbleHoverTrigger>
            );
        } else {
            return button;
        }
    } else {
        return (
            <Item className={getCssClassByType(itemId)} onClick={onClick} disabled={disabled}>
                {contentComponent}
            </Item>
        );
    }
};
