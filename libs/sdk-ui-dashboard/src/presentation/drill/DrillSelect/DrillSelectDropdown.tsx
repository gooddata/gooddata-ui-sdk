// (C) 2020-2021 GoodData Corporation

import React, { useMemo } from "react";
import stringify from "json-stable-stringify";
import { useIntl, IntlShape } from "react-intl";
import invariant from "ts-invariant";
import { IDrillEvent, UnexpectedSdkError } from "@gooddata/sdk-ui";
import {
    IListedDashboard,
    isDrillToInsight,
    isDrillToDashboard,
    isDrillToLegacyDashboard,
} from "@gooddata/sdk-backend-spi";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { isDrillDownDefinition } from "../../../types";
import { IInsight, insightRef, insightTitle, ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { DashboardDrillDefinition, isDrillToUrl } from "../types";
import { DrillSelectListBody } from "./DrillSelectListBody";
import { getDrillDownAttributeTitle } from "../utils/drillDownUtils";
import { DrillSelectContext, DrillType, DrillSelectItem } from "./types";
import { useDashboardSelector, selectListedDashboards } from "../../../model";
import { dashboardMatch } from "../utils/dashboardPredicate";
import { selectDashboardTitle, selectInsights } from "../../../model";
import { DRILL_SELECT_DROPDOWN_Z_INDEX } from "../../constants";

export interface DrillSelectDropdownProps extends DrillSelectContext {
    dropDownAnchorClass: string;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: DashboardDrillDefinition) => void;
}

export const DrillSelectDropdown: React.FC<DrillSelectDropdownProps> = (props) => {
    const { isOpen, dropDownAnchorClass, onClose, onSelect, drillDefinitions, drillEvent } = props;

    const intl = useIntl();
    const listedDashboards = useDashboardSelector(selectListedDashboards);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const insights = useDashboardSelector(selectInsights);

    const drillSelectItems = useMemo(
        () =>
            createDrillSelectItems(
                drillDefinitions,
                drillEvent,
                insights,
                listedDashboards,
                dashboardTitle,
                intl,
            ),
        [drillDefinitions, drillEvent, insights, listedDashboards, dashboardTitle, intl],
    );

    return isOpen ? (
        <div className="gd-drill-modal-picker-overlay-mask">
            <Overlay
                closeOnOutsideClick={true}
                closeOnEscape={true}
                alignTo={`.${dropDownAnchorClass}`}
                zIndex={DRILL_SELECT_DROPDOWN_Z_INDEX}
                onClose={onClose}
            >
                <DrillSelectListBody items={drillSelectItems} onSelect={onSelect} />
            </Overlay>
        </div>
    ) : null;
};

const getDashboardTitle = (dashboardRef: ObjRef, dashboardList: IListedDashboard[]) => {
    const dashboard = dashboardList.find((dashboard) =>
        dashboardMatch(dashboard.identifier, dashboard.ref, dashboardRef),
    );
    return dashboard ? dashboard.title : null;
};

export const createDrillSelectItems = (
    drillDefinitions: DashboardDrillDefinition[],
    drillEvent: IDrillEvent,
    insights: IInsight[],
    dashboardList: IListedDashboard[],
    dashboardTitle: string,
    intl: IntlShape,
): DrillSelectItem[] => {
    return drillDefinitions.map((drillDefinition): DrillSelectItem => {
        invariant(
            !isDrillToLegacyDashboard(drillDefinition),
            "Drill to pixel perfect dashboards from insight is not supported.",
        );

        if (isDrillDownDefinition(drillDefinition)) {
            const title = getDrillDownAttributeTitle(drillDefinition, drillEvent);

            return {
                type: DrillType.DRILL_DOWN,
                name: title,
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }
        if (isDrillToInsight(drillDefinition)) {
            const targetInsight = insights.find((i) =>
                areObjRefsEqual(drillDefinition.target, insightRef(i)),
            );
            const title = targetInsight && insightTitle(targetInsight);

            return {
                type: DrillType.DRILL_TO_INSIGHT,
                name: title!,
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }

        if (isDrillToDashboard(drillDefinition)) {
            const title = drillDefinition.target
                ? getDashboardTitle(drillDefinition.target, dashboardList)
                : dashboardTitle;
            return {
                type: DrillType.DRILL_TO_DASHBOARD,
                name: title!,
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }

        if (isDrillToUrl(drillDefinition)) {
            return {
                type: DrillType.DRILL_TO_URL,
                name: intl.formatMessage({ id: "drill_modal_picker.more.details" }),
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }

        const unhandledDefinition: never = drillDefinition;
        throw new UnexpectedSdkError(`Unhandled drill definition: ${JSON.stringify(unhandledDefinition)}`);
    });
};
