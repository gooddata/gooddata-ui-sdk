// (C) 2022 GoodData Corporation

import { useIntl } from "react-intl";
import { messages } from "../../../../locales.js";
import { DRILL_TARGET_TYPE } from "../../../drill/types.js";
import {
    selectEnableAttributeHierarchies,
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
}

export const useDrillTargetTypeItems = (): IDrillTargetType[] => {
    const dropdownItems = [];

    const intl = useIntl();
    const enableKPIDashboardDrillToDashboard = useDashboardSelector(selectEnableKPIDashboardDrillToDashboard);
    const enableKPIDashboardDrillToInsight = useDashboardSelector(selectEnableKPIDashboardDrillToInsight);
    const enableKPIDashboardDrillToURL = useDashboardSelector(selectEnableKPIDashboardDrillToURL);
    const enableAttributeHierarchies = useDashboardSelector(selectEnableAttributeHierarchies);
    const supportsAttributeHierarchies = useDashboardSelector(selectSupportsAttributeHierarchies);

    if (enableKPIDashboardDrillToDashboard) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
            title: intl.formatMessage(messages.drillToDashboardConfig),
        });
    }

    if (enableKPIDashboardDrillToInsight) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
            title: intl.formatMessage(messages.drillIntoInsight),
        });
    }

    if (enableAttributeHierarchies && supportsAttributeHierarchies) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_DOWN,
            title: intl.formatMessage(messages.drillDownConfig),
        });
    }

    if (enableKPIDashboardDrillToURL) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_URL,
            title: intl.formatMessage(messages.drillToUrlConfig),
        });
    }

    return dropdownItems;
};
