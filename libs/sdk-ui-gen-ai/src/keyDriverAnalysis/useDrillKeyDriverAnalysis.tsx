// (C) 2026 GoodData Corporation

import { type ReactNode, type RefObject, useCallback, useEffect, useMemo, useState } from "react";

import { useSelector } from "react-redux";

import { type IFilter, type IInsight, insightFilters } from "@gooddata/sdk-model";
import { DataViewFacade, type IDrillEvent, type IHeaderPredicate } from "@gooddata/sdk-ui";
import { DRILL_MENU_HOST_ATTRIBUTE, notifyDrillMenuExpandedChange } from "@gooddata/sdk-ui-charts";
import { type IDashboardKeyDriverCombinationItem } from "@gooddata/sdk-ui-dashboard";
import { Overlay, UiFocusManager } from "@gooddata/sdk-ui-kit";
import { _isEqual } from "@gooddata/util";

import { catalogItemsSelector } from "../store/chatWindow/chatWindowSelectors.js";

import { createKdaDefinitionFromDrill, getKdaDrillCombinations, getKdaDrillableItems } from "./drilling.js";
import { GenAiKdaDrillMenu } from "./GenAiKdaDrillMenu.js";
import { useOpenKeyDriverAnalysis } from "./useOpenKeyDriverAnalysis.js";

/**
 * Chart context for enabling Key Driver Analysis drilling.
 *
 * @beta
 */
export interface IUseDrillKeyDriverAnalysisOptions {
    /** Insight rendered by the chart. */
    insight: IInsight;
    /**
     * Complete effective chart filters, including renderer-level filters.
     * Defaults to the insight's filters. Only attribute filters are used; the selected comparison defines the dates.
     */
    filters?: IFilter[];
    /** Locale for the comparison menu and date formatting. Defaults to en-US. */
    locale?: string;
    /**
     * Whether Key Driver Analysis drilling is available to the current user. Defaults to true.
     * The application must check workspace availability and permissions; this does not enable the backend feature.
     */
    enabled?: boolean;
    /** Ref to the element wrapping the chart, used to position the menu at the drilled point. */
    anchorRef: RefObject<HTMLElement | null>;
    /** Whether the deployment supports second-level date granularities. Defaults to false. */
    enableSecondGranularities?: boolean;
}

/**
 * Chart props and the managed Key Driver Analysis comparison menu.
 *
 * @beta
 */
export interface IUseDrillKeyDriverAnalysisResult {
    /** Measure drill predicates that respect the insight's per-measure KDA controls. */
    drillableItems: IHeaderPredicate[];
    /** Chart drill handler. Disabled and unsupported drills do not open a menu. */
    onDrill: (event: IDrillEvent) => void;
    /** Positioned, localized comparison menu element, or null when closed. Render this alongside the chart. */
    drillMenu: ReactNode;
}

interface IDrillSelection {
    event: IDrillEvent;
    combinations: IDashboardKeyDriverCombinationItem[];
    filters: IFilter[];
    insight: IInsight;
    returnFocusTo: HTMLElement | null;
}

/**
 * Connects a custom chart drill to the Key Driver Analysis dialog through a managed Explain menu.
 *
 * @remarks
 * Use inside {@link GenAiStore}, with one {@link GenAiKeyDriverAnalysis} mounted under the same store.
 * Catalog items come from that store. Pass `drillableItems` and `onDrill` to the chart and render `drillMenu`
 * alongside it inside the element referenced by `anchorRef`. No internationalization provider is required.
 * The hook presents every available comparison and manages menu dismissal and keyboard focus restoration.
 *
 * @param options - Insight, effective filters, availability, locale, and chart anchor.
 * @returns Drillable items, the drill callback, and a menu element; not a component type.
 * @beta
 */
export function useDrillKeyDriverAnalysis({
    insight,
    filters,
    locale = "en-US",
    enabled = true,
    anchorRef,
    enableSecondGranularities = false,
}: IUseDrillKeyDriverAnalysisOptions): IUseDrillKeyDriverAnalysisResult {
    const catalogItems = useSelector(catalogItemsSelector);
    const openAnalysis = useOpenKeyDriverAnalysis();
    const [selection, setSelection] = useState<IDrillSelection>();
    const drillableItems = useMemo(() => getKdaDrillableItems(insight, enabled), [insight, enabled]);

    useEffect(() => {
        setSelection(undefined);
    }, [insight, enabled, enableSecondGranularities]);

    useEffect(() => {
        setSelection((current) =>
            current && !_isEqual(current.filters, filters ?? insightFilters(insight)) ? undefined : current,
        );
    }, [insight, filters]);

    useEffect(() => {
        const anchor = anchorRef.current;
        if (!anchor || !enabled) {
            return undefined;
        }
        const previousValue = anchor.getAttribute(DRILL_MENU_HOST_ATTRIBUTE);
        anchor.setAttribute(DRILL_MENU_HOST_ATTRIBUTE, "true");
        return () => {
            if (previousValue === null) {
                anchor.removeAttribute(DRILL_MENU_HOST_ATTRIBUTE);
            } else {
                anchor.setAttribute(DRILL_MENU_HOST_ATTRIBUTE, previousValue);
            }
        };
    }, [anchorRef, enabled]);

    const onDrill = useCallback(
        (event: IDrillEvent) => {
            const combinations = enabled
                ? getKdaDrillCombinations(event, enableSecondGranularities).filter((comparison) =>
                      drillableItems.some((predicate) =>
                          predicate(comparison.measure, { dv: DataViewFacade.for(event.dataView) }),
                      ),
                  )
                : [];
            setSelection(
                combinations.length
                    ? {
                          event,
                          combinations,
                          filters: filters ?? insightFilters(insight),
                          insight,
                          returnFocusTo: document.activeElement as HTMLElement | null,
                      }
                    : undefined,
            );
        },
        [enabled, enableSecondGranularities, drillableItems, filters, insight],
    );

    const onClose = useCallback(() => setSelection(undefined), []);
    const onSelect = useCallback(
        (comparison: IDashboardKeyDriverCombinationItem) => {
            if (!enabled || !selection || selection.insight !== insight) {
                return;
            }
            const definition = createKdaDefinitionFromDrill({
                catalogItems,
                locale,
                comparison,
                event: selection.event,
                filters: selection.filters,
            });
            if (definition) {
                openAnalysis(definition, {
                    drillEvent: selection.event,
                    returnFocusTo: selection.returnFocusTo ?? undefined,
                });
            }
        },
        [enabled, selection, insight, catalogItems, locale, openAnalysis],
    );

    return {
        drillableItems,
        onDrill,
        drillMenu:
            enabled && selection?.insight === insight ? (
                <KdaDrillMenu
                    selection={selection}
                    anchorRef={anchorRef}
                    locale={locale}
                    onSelect={onSelect}
                    onClose={onClose}
                />
            ) : null,
    };
}

function KdaDrillMenu({
    selection,
    anchorRef,
    locale,
    onSelect,
    onClose,
}: {
    selection: IDrillSelection;
    anchorRef: RefObject<HTMLElement | null>;
    locale: string;
    onSelect: (comparison: IDashboardKeyDriverCombinationItem) => void;
    onClose: () => void;
}) {
    const [aligned, setAligned] = useState(false);
    const onAlign = useCallback(() => setAligned(true), []);
    const { event } = selection;
    const anchor = anchorRef.current;
    const targetRect = (event.target ?? anchor)?.getBoundingClientRect();
    const anchorRect = anchor?.getBoundingClientRect();
    const offset = {
        x: (targetRect?.left ?? 0) - (anchorRect?.left ?? 0) + (event.chartX ?? 0),
        y: (targetRect?.top ?? 0) - (anchorRect?.top ?? 0) + (event.chartY ?? 0),
    };

    useEffect(() => {
        notifyDrillMenuExpandedChange(event.target, true);
        return () => notifyDrillMenuExpandedChange(event.target, false);
    }, [event]);

    return (
        <Overlay
            alignTo={anchor}
            alignPoints={[
                { align: "tl tl", offset },
                { align: "tl tr", offset },
            ]}
            closeOnOutsideClick
            closeOnParentScroll
            ensureVisibility
            onClose={onClose}
            onAlign={onAlign}
        >
            <UiFocusManager
                enableAutofocus={{ refocusKey: aligned }}
                enableReturnFocusOnUnmount={{ returnFocusTo: () => selection.returnFocusTo }}
                tabOutHandler={onClose}
            >
                <div
                    className="overlay dropdown-body"
                    onKeyDown={(event) => {
                        if (event.key === "Escape") {
                            event.stopPropagation();
                            onClose();
                        }
                    }}
                >
                    <GenAiKdaDrillMenu
                        combinations={selection.combinations}
                        locale={locale}
                        onSelect={onSelect}
                        onClose={onClose}
                    />
                </div>
            </UiFocusManager>
        </Overlay>
    );
}
