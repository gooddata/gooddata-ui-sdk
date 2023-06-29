// (C) 2019-2022 GoodData Corporation
import React, { useCallback } from "react";
import { insightVisualizationType, objRefToString, widgetRef } from "@gooddata/sdk-model";
import { stringUtils } from "@gooddata/util";
import cx from "classnames";
import { useIntl } from "react-intl";
import { Bubble, BubbleHoverTrigger, IAlignPoint } from "@gooddata/sdk-ui-kit";
import { VisType } from "@gooddata/sdk-ui";

import { selectCanExportTabular, selectSettings, useDashboardSelector } from "../../../../../model/index.js";
import { IDashboardInsightMenuButtonProps } from "../../types.js";

const nonExportableVisTypes: VisType[] = ["headline", "xirr"];
function isExportableVisualization(visType: VisType): boolean {
    return !nonExportableVisTypes.includes(visType);
}

const bubbleAlignPoints: IAlignPoint[] = [{ align: "tc bc" }, { align: "tc br" }];

export const LegacyInsightMenuButton: React.FC<IDashboardInsightMenuButtonProps> = ({
    onClick,
    widget,
    insight,
    isOpen,
}) => {
    const intl = useIntl();
    const onOptionsMenuClick = useCallback(() => {
        onClick();
    }, [onClick]);

    const settings = useDashboardSelector(selectSettings);
    const canExportTabular = useDashboardSelector(selectCanExportTabular);
    const areExportsEnabled = settings.enableKPIDashboardExport;
    const hasExportReportPermissions = canExportTabular;

    const visType = insightVisualizationType(insight) as VisType;
    const isExportableVisType = isExportableVisualization(visType);

    const canExportWidget = areExportsEnabled && hasExportReportPermissions && isExportableVisType;

    if (!canExportWidget) {
        return null;
    }

    const widgetRefValue = widgetRef(widget);
    const objRefAsString = widgetRefValue ? objRefToString(widgetRefValue) : "";

    const optionsIconClasses = cx(
        "dash-item-action-options",
        "s-dash-item-action-options",
        `dash-item-action-options-${stringUtils.simplifyText(objRefAsString)}`,
        `s-dash-item-action-options-${stringUtils.simplifyText(objRefAsString)}`,
        "gd-icon-download",
        {
            "dash-item-action-options-active": isOpen,
        },
    );

    return (
        <div
            className="dash-item-action-placeholder s-dash-item-action-placeholder"
            onClick={onOptionsMenuClick}
        >
            <BubbleHoverTrigger className={optionsIconClasses} showDelay={500} hideDelay={0} tagName="div">
                <Bubble className="bubble-primary" alignPoints={bubbleAlignPoints}>
                    <span>{intl.formatMessage({ id: "options.button.bubble" })}</span>
                </Bubble>
            </BubbleHoverTrigger>
        </div>
    );
};
