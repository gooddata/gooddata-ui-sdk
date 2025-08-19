// (C) 2020-2025 GoodData Corporation

import React, { useMemo, useCallback, useEffect, useRef } from "react";
import stringify from "json-stable-stringify";
import { useIntl, IntlShape } from "react-intl";
import { invariant } from "ts-invariant";
import partition from "lodash/partition.js";
import { IDrillEvent, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { UiFocusManager, Overlay, UiMenu } from "@gooddata/sdk-ui-kit";
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
import { DrillSelectDropdownMenuItem } from "./DrillSelectDropdownMenuItem.js";
import { useDrillSelectDropdownMenuItems } from "../hooks/useDrillSelectDropdownMenuItems.js";

export interface DrillSelectDropdownProps extends DrillSelectContext {
    dropDownAnchorClass: string;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: DashboardDrillDefinition) => void;
}

export const DrillSelectDropdown: React.FC<DrillSelectDropdownProps> = ({
    isOpen,
    dropDownAnchorClass,
    onClose,
    onSelect,
    drillDefinitions,
    drillEvent,
}) => {
    const intl = useIntl();

    const dashboardList = useDashboardSelector(selectAccessibleDashboards);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const insights = useDashboardSelector(selectInsightsMap);
    const widget = useDashboardSelector(selectWidgetByRef(drillEvent.widgetRef));
    const attributeDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayFormsById);

    const stopPropagation = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        e.stopPropagation();
    }, []);

    const previouslyFocusedRef = useRef<HTMLElement>(document.activeElement as HTMLElement);

    useEffect(() => {
        if (isOpen) {
            previouslyFocusedRef.current = document.activeElement as HTMLElement;
        }
    }, [isOpen]);

    const removeHighchartsFocusBorders = useCallback(() => {
        const focusBorders = document.getElementsByClassName("highcharts-focus-border");
        Array.from(focusBorders).forEach((el) => el.remove());
    }, []);

    const findNextFocusableVisualisation = useCallback(
        (currentElement: HTMLElement | null): HTMLElement | null => {
            if (!currentElement) {
                return null;
            }

            const focusableElements = Array.from(document.querySelectorAll<HTMLElement>("figure"));
            const currentIndex = focusableElements.findIndex((el) => el === currentElement.closest("figure"));

            if (currentIndex === -1) {
                return null;
            }

            const nextIndex = (currentIndex + 1) % focusableElements.length;
            return nextIndex === 0 ? null : (focusableElements[nextIndex] ?? null);
        },
        [],
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== "Tab") {
                return;
            }

            e.preventDefault();
            removeHighchartsFocusBorders();
            onClose();

            const nextElement = findNextFocusableVisualisation(previouslyFocusedRef.current);
            if (nextElement) {
                nextElement.focus();
            }
        },
        [previouslyFocusedRef, onClose, removeHighchartsFocusBorders, findNextFocusableVisualisation],
    );

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

    const [drillDownAndCrossFilteringItems, drillItems] = partition(
        drillSelectItems,
        (item: DrillSelectItem) =>
            isDrillDownDefinition(item.drillDefinition) || isCrossFiltering(item.drillDefinition),
    );

    const [drillDownItems, crossFilteringItems] = partition(
        drillDownAndCrossFilteringItems,
        (item: DrillSelectItem) => isDrillDownDefinition(item.drillDefinition),
    );

    const menuItems = useDrillSelectDropdownMenuItems({
        drillDownItems,
        drillItems,
        crossFilteringItems,
        onSelect,
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div className="gd-drill-modal-picker-overlay-mask">
            <Overlay
                closeOnOutsideClick={true}
                closeOnEscape={true}
                alignTo={`.${dropDownAnchorClass}`}
                onClose={onClose}
            >
                <UiFocusManager enableFocusTrap enableAutofocus enableReturnFocusOnUnmount>
                    <div
                        onScroll={stopPropagation}
                        className="gd-drill-modal-picker-dropdown s-drill-item-selector-dropdown"
                    >
                        <UiMenu
                            items={menuItems}
                            onSelect={(item) => onSelect(item.data.drillDefinition!)}
                            shouldCloseOnSelect={false}
                            onClose={onClose}
                            onUnhandledKeyDown={handleKeyDown}
                            maxHeight={160}
                            containerBottomPadding="medium"
                            ariaAttributes={{
                                id: "drill-select-menu",
                                "aria-label": intl.formatMessage({ id: "drill_modal_picker.label" }),
                            }}
                            InteractiveItem={DrillSelectDropdownMenuItem}
                        />
                    </div>
                </UiFocusManager>
            </Overlay>
        </div>
    );
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
                id: stringify(drillDefinition) || "undefined",
            };
        }
        if (isDrillToInsight(drillDefinition)) {
            const targetInsight = insights.get(drillDefinition.target);
            const title = targetInsight && insightTitle(targetInsight);

            return {
                type: DrillType.DRILL_TO_INSIGHT,
                name: title!,
                drillDefinition,
                id: stringify(drillDefinition) || "undefined",
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
                id: stringify(drillDefinition) || "undefined",
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
                id: stringify(drillDefinition) || "undefined",
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
                id: stringify(drillDefinition) || "undefined",
            };
        }

        const unhandledDefinition: never = drillDefinition;
        throw new UnexpectedSdkError(`Unhandled drill definition: ${JSON.stringify(unhandledDefinition)}`);
    });
};
