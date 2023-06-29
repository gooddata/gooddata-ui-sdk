// (C) 2019-2022 GoodData Corporation
import React from "react";
import { objRefToString, widgetRef } from "@gooddata/sdk-model";
import { Bubble, IAlignPoint, ItemsWrapper } from "@gooddata/sdk-ui-kit";
import { stringUtils } from "@gooddata/util";

import { LegacyInsightMenuItem } from "./LegacyInsightMenuItem.js";
import { DOWNLOADER_ID } from "../../../../../_staging/fileUtils/downloadFile.js";
import { IDashboardInsightMenuProps } from "../../types.js";

const alignPoints: IAlignPoint[] = [{ align: "bc tr", offset: { x: 2, y: 0 } }];

const ignoredOutsideClickClasses = [`#${DOWNLOADER_ID}`];

export const LegacyInsightMenu: React.FC<IDashboardInsightMenuProps> = ({ widget, items, onClose }) => {
    const widgetRefValue = widgetRef(widget);
    const exportWidgetRefAsString = objRefToString(widgetRefValue);

    return (
        <Bubble
            alignTo={`.s-dash-item-action-options-${stringUtils.simplifyText(exportWidgetRefAsString)}`}
            alignPoints={alignPoints}
            className="bubble-light options-menu-bubble s-options-menu-bubble"
            closeOnOutsideClick
            // we need to ignore the "clicks" on the hidden downloader link to prevent the menu from closing
            // when the download starts (if the user opened it again before the download was ready)
            ignoreClicksOnByClass={ignoredOutsideClickClasses}
            onClose={onClose}
        >
            <ItemsWrapper smallItemsSpacing>
                {items.map((item) => {
                    // legacy menu does not support separators
                    if (item.type !== "button") {
                        return null;
                    }
                    return (
                        <LegacyInsightMenuItem
                            key={item.itemId}
                            bubbleId={item.itemId}
                            bubbleMessage={item.tooltip}
                            className={item.className}
                            isDisabled={item.disabled}
                            title={item.itemName}
                            onClick={item.onClick}
                        />
                    );
                })}
            </ItemsWrapper>
        </Bubble>
    );
};
