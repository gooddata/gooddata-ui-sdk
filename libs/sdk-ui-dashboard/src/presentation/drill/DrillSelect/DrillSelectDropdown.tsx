// (C) 2020-2026 GoodData Corporation

import { type KeyboardEvent, type UIEvent, useCallback, useEffect, useMemo, useRef } from "react";

import stringify from "json-stable-stringify";
import { compact, groupBy } from "lodash-es";
import { type IntlShape, useIntl } from "react-intl";
import { invariant } from "ts-invariant";

import {
    type IAttributeDisplayFormMetadataObject,
    type IInsight,
    type IListedDashboard,
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    insightTitle,
    isAttributeDescriptor,
    isCrossFiltering,
    isDrillFromAttribute,
    isDrillToCustomUrl,
    isDrillToDashboard,
    isDrillToInsight,
    isDrillToLegacyDashboard,
    isIdentifierRef,
    isKeyDriveAnalysis,
} from "@gooddata/sdk-model";
import { type IDrillEvent, UnexpectedSdkError } from "@gooddata/sdk-ui";
import { type IAlignPoint, Overlay, UiFocusManager, UiMenu } from "@gooddata/sdk-ui-kit";

import { DrillSelectDropdownMenuItem } from "./DrillSelectDropdownMenuItem.js";
import { type DrillSelectContext, type DrillSelectItem, DrillType } from "./types.js";
import { getDrillOriginLocalIdentifier } from "../../../_staging/drills/drillingUtils.js";
import { type ObjRefMap } from "../../../_staging/metadata/objRefMap.js";
import {
    selectAccessibleDashboards,
    selectCatalogAttributeDisplayFormsById,
    selectDashboardTitle,
    selectEnableDashboardTabs,
    selectEnableImplicitDrillToUrl,
    selectInsightsMap,
    selectWidgetByRef,
    useDashboardSelector,
} from "../../../model/index.js";
import { type DashboardDrillDefinition, isDrillDownDefinition } from "../../../types.js";
import { useDrillSelectDropdownMenuItems } from "../hooks/useDrillSelectDropdownMenuItems.js";
import { isDrillToUrl } from "../types.js";
import { dashboardMatch } from "../utils/dashboardPredicate.js";
import {
    getDrillDownTitle,
    getDrillOriginAttributeElementTitle,
    getTotalDrillToUrlCount,
} from "../utils/drillDownUtils.js";
import { getDrillToCustomUrlMissingAttributes } from "../utils/drillToCustomUrlUtils.js";
import { getKdaKeyDriverCombinations, getKeyDriverCombinationItemTitle } from "../utils/kdaUtils.js";

export interface DrillSelectDropdownProps extends DrillSelectContext {
    dropDownAnchorClass: string;
    isOpen: boolean;
    onClose: () => void;
    onCloseReturnFocus: () => void;
    onSelect: (item: DashboardDrillDefinition, context: unknown) => void;
}

export function DrillSelectDropdown({
    isOpen,
    dropDownAnchorClass,
    onClose,
    onCloseReturnFocus,
    onSelect,
    drillDefinitions,
    drillEvent,
}: DrillSelectDropdownProps) {
    const intl = useIntl();

    const dashboardList = useDashboardSelector(selectAccessibleDashboards);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const insights = useDashboardSelector(selectInsightsMap);
    const widget = useDashboardSelector(selectWidgetByRef(drillEvent.widgetRef));
    const attributeDisplayForms = useDashboardSelector(selectCatalogAttributeDisplayFormsById);
    const enableDashboardTabs = useDashboardSelector(selectEnableDashboardTabs);
    const enableImplicitDrillToUrl = useDashboardSelector(selectEnableImplicitDrillToUrl);

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
                enableDashboardTabs,
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
            enableDashboardTabs,
        ],
    );

    const grouped = groupBy(drillSelectItems, (item) => {
        if (isDrillDownDefinition(item.drillDefinition)) {
            return "drillDown";
        }
        if (isDrillToUrl(item.drillDefinition) && enableImplicitDrillToUrl) {
            return "drillToUrl";
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
        drillToUrlItems: grouped["drillToUrl"] ?? [],
        onSelect,
    });

    useEffect(() => {
        if (isOpen && menuItems.length === 0) {
            onCloseReturnFocus();
        }
    }, [isOpen, menuItems.length, onCloseReturnFocus]);

    const alignPoints = useMemo<IAlignPoint[] | undefined>(() => {
        if (!drillEvent.enableDrillMenuPositioningAtCursor) {
            return undefined;
        }
        return calculateAlignPoints(dropDownAnchorClass, drillEvent);
    }, [dropDownAnchorClass, drillEvent]);

    if (!isOpen) {
        return null;
    }
    if (menuItems.length === 0) {
        return null;
    }

    return (
        <div className="gd-drill-modal-picker-overlay-mask">
            <Overlay
                closeOnOutsideClick
                closeOnEscape
                alignTo={`.${dropDownAnchorClass}`}
                alignPoints={alignPoints}
                onClose={onCloseReturnFocus}
            >
                <UiFocusManager enableFocusTrap enableAutofocus>
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
                            onClose={onCloseReturnFocus}
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

/**
 * Calculate the relative offset between a child element and an ancestor element.
 */
function getRelativeOffset(child?: HTMLElement, ancestor?: HTMLElement | null) {
    if (!child || !ancestor) {
        return { x: 0, y: 0 };
    }
    const childRect = child.getBoundingClientRect();
    const ancestorRect = ancestor.getBoundingClientRect();
    return {
        x: childRect.left - ancestorRect.left,
        y: childRect.top - ancestorRect.top,
    };
}

/**
 * Calculate the offset for the drill select dropdown based on the drill event coordinates.
 * This positions the dropdown near the clicked element rather than the center of the visualization.
 */
function calculateDrillEventOffset(anchorSelector: string, drillEvent?: IDrillEvent) {
    const anchorElement = document.querySelector(anchorSelector) as HTMLElement | null;
    // Get the relative offset between the drill target element (e.g., chart container) and the anchor element
    const relativeOffset = getRelativeOffset(drillEvent?.target, anchorElement);
    return {
        x: relativeOffset.x + (drillEvent?.chartX ?? 0),
        y: relativeOffset.y + (drillEvent?.chartY ?? 0),
    };
}

// Small offset to position the menu slightly away from the click point for better UX
const MENU_OFFSET_PX = 10;

/**
 * Calculate align points for the Overlay component based on the drill event coordinates.
 * Align format is "anchor_point overlay_point" - we keep anchor at tl (using offset for click position)
 * and vary the overlay point to allow the menu to flip when near viewport edges.
 */
function calculateAlignPoints(anchorClass: string, drillEvent?: IDrillEvent): IAlignPoint[] {
    const drillOffset = calculateDrillEventOffset(`.${anchorClass}`, drillEvent);

    return [
        {
            // Menu's top-left at click point → opens to bottom-right
            align: "tl tl",
            offset: {
                x: drillOffset.x + MENU_OFFSET_PX,
                y: drillOffset.y + MENU_OFFSET_PX,
            },
        },
        {
            // Menu's top-right at click point → opens to bottom-left
            align: "tl tr",
            offset: {
                x: drillOffset.x - MENU_OFFSET_PX,
                y: drillOffset.y + MENU_OFFSET_PX,
            },
        },
        {
            // Menu's bottom-left at click point → opens to top-right
            align: "tl bl",
            offset: {
                x: drillOffset.x + MENU_OFFSET_PX,
                y: drillOffset.y - MENU_OFFSET_PX,
            },
        },
        {
            // Menu's bottom-right at click point → opens to top-left
            align: "tl br",
            offset: {
                x: drillOffset.x - MENU_OFFSET_PX,
                y: drillOffset.y - MENU_OFFSET_PX,
            },
        },
    ];
}

export const createDrillSelectItems = ({
    drillDefinitions,
    drillEvent,
    insights,
    dashboardList,
    dashboardTitle,
    intl,
    widget,
    attributeDisplayForms,
    enableDashboardTabs,
}: {
    drillDefinitions: DashboardDrillDefinition[];
    drillEvent: IDrillEvent;
    insights: ObjRefMap<IInsight>;
    dashboardList: IListedDashboard[];
    dashboardTitle: string;
    intl: IntlShape;
    widget?: IWidget;
    attributeDisplayForms: Record<string, IAttributeDisplayFormMetadataObject>;
    enableDashboardTabs: boolean;
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

            // If targetTab is specified, append tab name to the title
            let fullTitle = title;
            if (drillDefinition.targetTabLocalIdentifier && enableDashboardTabs) {
                const dashboard = dashboardList.find((d) => areObjRefsEqual(d.ref, drillDefinition.target));
                const tabTitle =
                    dashboard?.tabs?.find(
                        (t) => t.localIdentifier === drillDefinition.targetTabLocalIdentifier,
                    )?.title ?? undefined;
                if (dashboard?.tabs?.length && dashboard?.tabs?.length > 1 && tabTitle) {
                    fullTitle = `${title} / ${tabTitle}`;
                }
            }

            return {
                type: DrillType.DRILL_TO_DASHBOARD,
                name: fullTitle!,
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

            // Check if drill to custom URL has unavailable attribute placeholders
            // e.g. multilayer geo charts with different attributes on same measure
            const missingAttributes = isDrillToCustomUrl(drillDefinition)
                ? getDrillToCustomUrlMissingAttributes(drillDefinition, drillEvent, attributeDisplayForms)
                : [];

            const isDisabled = missingAttributes.length > 0;
            const tooltipText = isDisabled
                ? intl.formatMessage(
                      { id: "drill_modal_picker.drill_to_url.disabled.missing_attributes" },
                      { attributes: missingAttributes.join(", ") },
                  )
                : undefined;

            return {
                type: DrillType.DRILL_TO_URL,
                name: intl.formatMessage({ id: "drill_modal_picker.more.details" }),
                drillDefinition,
                attributeValue,
                id: stringify(drillDefinition) || "undefined",
                isDisabled,
                tooltipText,
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
