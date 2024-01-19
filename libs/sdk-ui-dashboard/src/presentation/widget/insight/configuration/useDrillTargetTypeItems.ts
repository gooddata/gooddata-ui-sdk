// (C) 2022-2024 GoodData Corporation
import { useIntl } from "react-intl";
import { messages as uiMessages } from "@gooddata/sdk-ui";

import { messages } from "../../../../locales.js";
import { DRILL_TARGET_TYPE } from "../../../drill/types.js";
import {
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToURL,
    selectSupportsAttributeHierarchies,
    useDashboardSelector,
} from "../../../../model/index.js";

export interface IDrillTargetType {
    id: DRILL_TARGET_TYPE;
    title: string;
    disabled?: boolean;
    disableTooltipMessage?: string;
    tooltipMessage?: string;
    documentUrl?: string;
}

export const useDrillTargetTypeItems = (disableDrillDown?: boolean): IDrillTargetType[] => {
    const dropdownItems = [];

    const intl = useIntl();
    const enableKPIDashboardDrillToDashboard = useDashboardSelector(selectEnableKPIDashboardDrillToDashboard);
    const enableKPIDashboardDrillToInsight = useDashboardSelector(selectEnableKPIDashboardDrillToInsight);
    const enableKPIDashboardDrillToURL = useDashboardSelector(selectEnableKPIDashboardDrillToURL);
    const supportsAttributeHierarchies = useDashboardSelector(selectSupportsAttributeHierarchies);

    if (enableKPIDashboardDrillToDashboard) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
            title: intl.formatMessage(messages.drillToDashboardConfig),
            tooltipMessage: uiMessages.drillToDashboardTooltip.id,
            documentUrl:
                "https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-into-dashboard/",
        });
    }

    if (enableKPIDashboardDrillToInsight) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
            title: intl.formatMessage(messages.drillIntoInsight),
            tooltipMessage: uiMessages.drillToInsightTooltip.id,
            documentUrl:
                "https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-into-insight/",
        });
    }

    if (supportsAttributeHierarchies) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_DOWN,
            title: intl.formatMessage(messages.drillDownConfig),
            disabled: disableDrillDown,
            disableTooltipMessage: disableDrillDown
                ? intl.formatMessage(messages.disableDrillDownToolTip)
                : undefined,
            tooltipMessage: uiMessages.drilldownTooltip.id,
            documentUrl:
                "https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-down/",
        });
    }

    if (enableKPIDashboardDrillToURL) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_URL,
            title: intl.formatMessage(messages.drillToUrlConfig),
            tooltipMessage: uiMessages.drillToUrlTooltip.id,
            documentUrl:
                "https://www.gooddata.com/docs/cloud/create-dashboards/drilling-in-dashboards/set-drill-into-hyperlink/",
        });
    }

    return dropdownItems;
};
