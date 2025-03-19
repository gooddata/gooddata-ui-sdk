// (C) 2020-2024 GoodData Corporation

import React, { useMemo } from "react";
import stringify from "json-stable-stringify";
import { useIntl, IntlShape } from "react-intl";
import { invariant } from "ts-invariant";
import { IDrillEvent, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";
import { DashboardDrillDefinition, isDrillDownDefinition } from "../../../types.js";
import {
    IInsight,
    insightTitle,
    ObjRef,
    isDrillFromAttribute,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    IListedDashboard,
    isCrossFiltering,
    isAttributeDescriptor,
    IAttributeDisplayFormMetadataObject,
    isIdentifierRef,
    IWidget,
} from "@gooddata/sdk-model";
import { isDrillToUrl } from "../types.js";
import { DrillSelectListBody } from "./DrillSelectListBody.js";
import {
    getDrillDownTitle,
    getDrillOriginAttributeElementTitle,
    getTotalDrillToUrlCount,
} from "../utils/drillDownUtils.js";
import { DrillSelectContext, DrillType, DrillSelectItem } from "./types.js";
import {
    selectAccessibleDashboards,
    selectCatalogAttributeDisplayFormsById,
    selectDashboardTitle,
    selectInsightsMap,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../model/index.js";
import { dashboardMatch } from "../utils/dashboardPredicate.js";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import compact from "lodash/compact.js";

export interface DrillSelectDropdownProps extends DrillSelectContext {
    dropDownAnchorClass: string;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: DashboardDrillDefinition) => void;
}

export const DrillSelectDropdown: React.FC<DrillSelectDropdownProps> = (props) => {
    const { isOpen, dropDownAnchorClass, onClose, onSelect, drillDefinitions, drillEvent } = props;
    const intl = useIntl();
    const dashboardList = useDashboardSelector(selectAccessibleDashboards);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const insights = useDashboardSelector(selectInsightsMap);
    const widget = useDashboardSelector(selectWidgetByRef(drillEvent.widgetRef));
    const attributeDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayFormsById);

    const drillSelectItems = useMemo(
        () =>
            createDrillSelectItems({
                drillDefinitions,
                drillEvent,
                insights,
                dashboardList,
                dashboardTitle,
                attributeDisplayForms,
                intl,
                widget: widget as IWidget,
            }),
        [
            drillDefinitions,
            drillEvent,
            insights,
            dashboardList,
            dashboardTitle,
            intl,
            widget,
            attributeDisplayForms,
        ],
    );

    return isOpen ? (
        <div className="gd-drill-modal-picker-overlay-mask">
            <Overlay
                closeOnOutsideClick={true}
                closeOnEscape={true}
                alignTo={`.${dropDownAnchorClass}`}
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

export const createDrillSelectItems = ({
    drillDefinitions,
    drillEvent,
    insights,
    dashboardList,
    dashboardTitle,
    intl,
    widget,
    attributeDisplayForms,
}: {
    drillDefinitions: DashboardDrillDefinition[];
    drillEvent: IDrillEvent;
    insights: ObjRefMap<IInsight>;
    dashboardList: IListedDashboard[];
    dashboardTitle: string;
    intl: IntlShape;
    widget?: IWidget;
    attributeDisplayForms: Record<string, IAttributeDisplayFormMetadataObject>;
}): DrillSelectItem[] => {
    const totalDrillToUrls = getTotalDrillToUrlCount(drillDefinitions);

    return drillDefinitions.map((drillDefinition): DrillSelectItem => {
        invariant(
            !isDrillToLegacyDashboard(drillDefinition),
            "Drill to pixel perfect dashboards from insight is not supported.",
        );

        if (isDrillDownDefinition(drillDefinition)) {
            const { title: drillTitle } = drillDefinition;
            const drillTargetIdentifier = isIdentifierRef(drillDefinition.target)
                ? drillDefinition.target.identifier
                : drillDefinition.target.uri;
            const drillTargetDisplayForm = attributeDisplayForms[drillTargetIdentifier];
            const title = getDrillDownTitle(
                drillDefinition,
                drillEvent,
                widget?.drillDownIntersectionIgnoredAttributes,
                drillTargetDisplayForm,
            );

            return {
                type: DrillType.DRILL_DOWN,
                name: drillTitle ?? title ?? "NULL", // TODO localize this? drilldown is currently only on bear and that does not support nulls anyway
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
                    ? getDrillOriginAttributeElementTitle(drillToUrlOrigin, drillEvent)
                    : undefined;

            return {
                type: DrillType.DRILL_TO_URL,
                name: intl.formatMessage({ id: "drill_modal_picker.more.details" }),
                drillDefinition,
                attributeValue,
                id: stringify(drillDefinition),
            };
        }

        if (isCrossFiltering(drillDefinition)) {
            const title = compact(
                drillEvent.drillContext.intersection?.map((item) =>
                    isAttributeDescriptor(item.header) && !item.header.attributeHeader.granularity
                        ? item.header.attributeHeader.name
                        : undefined,
                ),
            ).join(", ");

            return {
                name: title,
                type: DrillType.CROSS_FILTERING,
                drillDefinition,
                id: stringify(drillDefinition),
            };
        }

        const unhandledDefinition: never = drillDefinition;
        throw new UnexpectedSdkError(`Unhandled drill definition: ${JSON.stringify(unhandledDefinition)}`);
    });
};
