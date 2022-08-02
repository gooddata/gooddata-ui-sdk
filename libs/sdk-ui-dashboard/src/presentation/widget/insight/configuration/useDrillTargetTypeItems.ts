// (C) 2022 GoodData Corporation

import { useIntl } from "react-intl";
import { DRILL_TARGET_TYPE } from "../../../drill/types";
import {
    selectConfig,
    selectEnableKPIDashboardDrillToDashboard,
    selectEnableKPIDashboardDrillToInsight,
    selectEnableKPIDashboardDrillToURL,
    useDashboardSelector,
} from "../../../../model";

export interface IDrillTargetType {
    id: DRILL_TARGET_TYPE;
    title: string;
}

export const useDrillTargetTypeItems = (): IDrillTargetType[] => {
    const dropdownItems = [];

    const intl = useIntl();
    const enableKPIDashboardDrillToDashboard = useDashboardSelector(selectEnableKPIDashboardDrillToDashboard);
    const enableKPIDashboardDrillToInsight = useDashboardSelector(selectEnableKPIDashboardDrillToInsight);
    const enableKPIDashboardDrillToURL = useDashboardSelector(selectEnableKPIDashboardDrillToURL);

    console.log(enableKPIDashboardDrillToDashboard);

    if (enableKPIDashboardDrillToDashboard) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_DASHBOARD,
            title: intl.formatMessage({ id: "configurationPanel.drillConfig.drillIntoDashboard" }),
        });
    }

    if (enableKPIDashboardDrillToInsight) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_INSIGHT,
            title: intl.formatMessage({ id: "configurationPanel.drillConfig.drillIntoInsight" }),
        });
    }

    if (enableKPIDashboardDrillToURL) {
        dropdownItems.push({
            id: DRILL_TARGET_TYPE.DRILL_TO_URL,
            title: intl.formatMessage({ id: "configurationPanel.drillConfig.drillIntoUrl" }),
        });
    }

    console.log(dropdownItems);
    return dropdownItems;
};
