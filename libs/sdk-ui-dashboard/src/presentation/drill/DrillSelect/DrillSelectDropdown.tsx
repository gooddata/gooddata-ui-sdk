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
    isDrillFromAttribute,
} from "@gooddata/sdk-backend-spi";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { DashboardDrillDefinition, isDrillDownDefinition } from "../../../types";
import { IInsight, insightTitle, ObjRef } from "@gooddata/sdk-model";
import { isDrillToUrl } from "../types";
import { DrillSelectListBody } from "./DrillSelectListBody";
import { getDrillDownAttributeTitle, getTotalDrillToUrlCount } from "../utils/drillDownUtils";
import { DrillSelectContext, DrillType, DrillSelectItem } from "./types";
import { useDashboardSelector, selectListedDashboards, selectInsightsMap } from "../../../model";
import { dashboardMatch } from "../utils/dashboardPredicate";
import { selectDashboardTitle } from "../../../model";
import { DRILL_SELECT_DROPDOWN_Z_INDEX } from "../../constants";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap";

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
    const insights = useDashboardSelector(selectInsightsMap);

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
    insights: ObjRefMap<IInsight>,
    dashboardList: IListedDashboard[],
    dashboardTitle: string,
    intl: IntlShape,
): DrillSelectItem[] => {
    const totalDrillToUrls = getTotalDrillToUrlCount(drillDefinitions);

    return drillDefinitions.map((drillDefinition): DrillSelectItem => {
        invariant(
            !isDrillToLegacyDashboard(drillDefinition),
            "Drill to pixel perfect dashboards from insight is not supported.",
        );

        if (isDrillDownDefinition(drillDefinition)) {
            const drillDownOrigin = getDrillOriginLocalIdentifier(drillDefinition);
            const title = getDrillDownAttributeTitle(drillDownOrigin, drillEvent);

            return {
                type: DrillType.DRILL_DOWN,
                name: title,
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }
        if (isDrillToInsight(drillDefinition)) {
            const targetInsight = insights.get(drillDefinition.target);
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
            const drillToUrlOrigin = getDrillOriginLocalIdentifier(drillDefinition);

            const attributeValue =
                isDrillFromAttribute(drillDefinition.origin) && totalDrillToUrls > 1
                    ? getDrillDownAttributeTitle(drillToUrlOrigin, drillEvent)
                    : undefined;

            return {
                type: DrillType.DRILL_TO_URL,
                name: intl.formatMessage({ id: "drill_modal_picker.more.details" }),
                drillDefinition,
                attributeValue,
                id: stringify(drillDefinition),
            };
        }

        const unhandledDefinition: never = drillDefinition;
        throw new UnexpectedSdkError(`Unhandled drill definition: ${JSON.stringify(unhandledDefinition)}`);
    });
};
