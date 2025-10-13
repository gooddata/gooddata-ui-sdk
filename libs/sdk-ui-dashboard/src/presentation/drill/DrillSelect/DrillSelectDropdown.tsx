// (C) 2020-2025 GoodData Corporation

import { KeyboardEvent, UIEvent, useCallback, useEffect, useMemo, useRef } from "react";

import stringify from "json-stable-stringify";
import { compact, groupBy } from "lodash-es";
import { IntlShape, useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import {
    IAttributeDisplayFormMetadataObject,
    IInsight,
    IListedDashboard,
    IWidget,
    ObjRef,
    insightTitle,
    isAttributeDescriptor,
    isCrossFiltering,
    isDrillFromAttribute,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    isIdentifierRef,
    isKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { IDrillEvent, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { Overlay, UiFocusManager, UiMenu } from "@gooddata/sdk-ui-kit";

import { DrillSelectDropdownMenuItem } from "./DrillSelectDropdownMenuItem.js";
import { DrillSelectContext, DrillSelectItem, DrillType } from "./types.js";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils.js";
import { ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import {
    selectAccessibleDashboards,
    selectCatalogAttributeDisplayFormsById,
    selectDashboardTitle,
    selectInsightsMap,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../model/index.js";
import { DashboardDrillDefinition, isDrillDownDefinition } from "../../../types.js";
import { useDrillSelectDropdownMenuItems } from "../hooks/useDrillSelectDropdownMenuItems.js";
import { isDrillToUrl } from "../types.js";
import { dashboardMatch } from "../utils/dashboardPredicate.js";
import {
    getDrillDownTitle,
    getDrillOriginAttributeElementTitle,
    getTotalDrillToUrlCount,
} from "../utils/drillDownUtils.js";
import { getKdaKeyDriverCombinations, getKeyDriverCombinationItemTitle } from "../utils/kdaUtils.js";

export interface DrillSelectDropdownProps extends DrillSelectContext {
    dropDownAnchorClass: string;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (item: DashboardDrillDefinition, context: unknown) => void;
    visualizationId?: string;
}

export function DrillSelectDropdown({
    isOpen,
    dropDownAnchorClass,
    onClose,
    onSelect,
    drillDefinitions,
    drillEvent,
    visualizationId,
}: DrillSelectDropdownProps) {
    const intl = useIntl();

    const dashboardList = useDashboardSelector(selectAccessibleDashboards);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const insights = useDashboardSelector(selectInsightsMap);
    const widget = useDashboardSelector(selectWidgetByRef(drillEvent.widgetRef));
    const attributeDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayFormsById);

    const stopPropagation = useCallback((e: UIEvent<HTMLDivElement>) => {
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
        (e: KeyboardEvent) => {
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

    const grouped = groupBy(drillSelectItems, (item) => {
        if (isDrillDownDefinition(item.drillDefinition)) {
            return "drillDown";
        }
        if (isCrossFiltering(item.drillDefinition)) {
            return "crossFiltering";
        }
        if (isKeyDriveAnalysis(item.drillDefinition)) {
            return "keyDriverAnalysis";
        }
        return "drill";
    });

    const menuItems = useDrillSelectDropdownMenuItems({
        drillDownItems: grouped["drillDown"] ?? [],
        crossFilteringItems: grouped["crossFiltering"] ?? [],
        keyDriverAnalysisItems: grouped["keyDriverAnalysis"] ?? [],
        drillItems: grouped["drill"] ?? [],
        onSelect,
        onClose,
    });

    if (!isOpen) {
        return null;
    }

    return (
        <div className="gd-drill-modal-picker-overlay-mask">
            <Overlay closeOnOutsideClick closeOnEscape alignTo={`.${dropDownAnchorClass}`} onClose={onClose}>
                <UiFocusManager
                    enableFocusTrap
                    enableAutofocus
                    enableReturnFocusOnUnmount={
                        visualizationId
                            ? {
                                  returnFocusTo: () => {
                                      // Charts are rebuilt when the filter changes, which makes them lose focus.
                                      // We need to refocus after a bit of delay.

                                      window.setTimeout(() => {
                                          if (document.activeElement !== document.body) {
                                              // Ugly hack. If the chart is not rebuilt, we don't want to mess with the focus.
                                              return;
                                          }

                                          const element = document.getElementById(visualizationId);
                                          const viz = element?.querySelector("[tabindex='0']");
                                          (viz as HTMLElement)?.focus();
                                      }, 150);
                                      return null;
                                  },
                              }
                            : undefined
                    }
                >
                    <div
                        onScroll={stopPropagation}
                        className="gd-drill-modal-picker-dropdown s-drill-item-selector-dropdown"
                    >
                        <UiMenu
                            items={menuItems}
                            onSelect={(item) => {
                                item.data.onSelect();
                            }}
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
}

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

    return drillDefinitions.flatMap((drillDefinition): DrillSelectItem | DrillSelectItem[] => {
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

        if (isKeyDriveAnalysis(drillDefinition)) {
            const items = getKdaKeyDriverCombinations(drillDefinition, drillEvent);
            return items.map((item) => {
                return {
                    name: getKeyDriverCombinationItemTitle(intl, item),
                    type: DrillType.KEY_DRIVER_ANALYSIS,
                    drillDefinition,
                    id: stringify(drillDefinition) || "undefined",
                    context: item,
                } as DrillSelectItem;
            });
        }

        const unhandledDefinition: never = drillDefinition;
        throw new UnexpectedSdkError(`Unhandled drill definition: ${JSON.stringify(unhandledDefinition)}`);
    });
};
