// (C) 2020-2026 GoodData Corporation

import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";

import { defineMessages } from "react-intl";

import {
    type AdSetTimezoneCommandData,
    GdcAdCommandType,
    GdcErrorType,
    GdcProductName,
    type ICommandFailedBody,
} from "@gooddata/sdk-embedding";
import { type ICatalogAttribute, type IFilter, isInsightWidget } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import type { IAnalyticalDesignerApi } from "@gooddata/sdk-ui-analytical-designer";
import { useToastMessage } from "@gooddata/sdk-ui-kit";

import { queryWidgetFilters } from "../../model/queries/widgets.js";
import { useDashboardDispatch, useDashboardSelector } from "../../model/react/DashboardStoreProvider.js";
import { queryAndWaitFor } from "../../model/store/_infra/queryAndWaitFor.js";
import { selectBackendCapabilities } from "../../model/store/backendCapabilities/backendCapabilitiesSelectors.js";
import {
    selectEnableComputedAttributes,
    selectEnableMeasureValueFilterKD,
    selectEnableTimezoneChange,
} from "../../model/store/config/configSelectors.js";
import { selectInsightByWidgetRef } from "../../model/store/insights/insightsSelectors.js";
import { selectEffectiveDashboardTimezone } from "../../model/store/meta/metaSelectors.js";
import { selectAttributeFilterConfigsDisplayAsLabelMap } from "../../model/store/tabs/attributeFilterConfigs/attributeFilterConfigsSelectors.js";
import {
    selectFilterContextDateFilter,
    selectFilterContextMeasureValueFilters,
} from "../../model/store/tabs/filterContext/filterContextSelectors.js";
import { selectAnalyticalWidgetByRef } from "../../model/store/tabs/layout/layoutSelectors.js";
import { type InsightEditorTarget } from "../../model/types/insightEditorTypes.js";

import {
    buildInsightEditorFilterContext,
    loadInsightAvailableAttributes,
} from "./filterContext/insightFilterContext.js";

const KEEP_FILTER_CONTEXT_ID = "keepFilterContext";
const RETRY_DELAY_MS = 300;
const MAX_KEEPING_DURATION_MS = 5000;
const TOAST_DURATION_MS = 5000;

const messages = defineMessages({
    dateFilterInapplicable: { id: "insightEditor.filterContext.dateFilterInapplicable" },
    invalidFilterItemsCount: { id: "insightEditor.filterContext.invalidFilterItemsCount" },
    tookTooLong: { id: "insightEditor.filterContext.tookTooLong" },
    failed: { id: "insightEditor.filterContext.failed" },
});

export interface IExploreFilterTransfer {
    onInsightOpened: () => void;
    onInsightRendered: () => void;
    onCommandFailed: (data: ICommandFailedBody, contextId?: string) => void;
}

/**
 * Passes the dashboard filters and timezone of the explored widget to Analytical Designer, so the
 * explored insight shows the same data as the widget.
 *
 * @remarks
 * The transfer starts when the opened insight first renders. Analytical Designer replaces its filters
 * with each answer of the visualization to a reference point change. An answer that the opened
 * insight requested can arrive after the filters were set, and then removes them without an error.
 * When Analytical Designer is not ready yet (its date datasets still load), the command fails and the
 * transfer retries until it succeeds or takes too long. A later render starts the transfer again if
 * the retries stopped too early.
 */
export function useExploreFilterTransfer(
    target: InsightEditorTarget,
    isExplore: boolean,
    apiRef: RefObject<IAnalyticalDesignerApi | null>,
): IExploreFilterTransfer {
    const dispatch = useDashboardDispatch();
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const { addWarning } = useToastMessage();

    const widgetRef = target.type === "widget" ? target.ref : undefined;
    const state = {
        widget: useDashboardSelector(selectAnalyticalWidgetByRef(widgetRef)),
        insight: useDashboardSelector(selectInsightByWidgetRef(widgetRef)),
        capabilities: useDashboardSelector(selectBackendCapabilities),
        displayAsLabelMap: useDashboardSelector(selectAttributeFilterConfigsDisplayAsLabelMap),
        dateFilter: useDashboardSelector(selectFilterContextDateFilter),
        isMeasureValueFilterEnabled: useDashboardSelector(selectEnableMeasureValueFilterKD),
        measureValueFilters: useDashboardSelector(selectFilterContextMeasureValueFilters),
        enableComputedAttributes: useDashboardSelector(selectEnableComputedAttributes),
        isTimezoneEnabled: useDashboardSelector(selectEnableTimezoneChange),
        timezone: useDashboardSelector(selectEffectiveDashboardTimezone),
    };
    const stateRef = useRef(state);
    useEffect(() => {
        stateRef.current = state;
    });

    const progress = useRef({
        isInsightOpened: false,
        isFilterContextKept: false,
        isFailureReported: false,
        startTime: 0,
    });
    const availableAttributes = useRef<Promise<ICatalogAttribute[]> | null>(null);
    const retryTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const latestRun = useRef(0);

    // The attributes load while Analytical Designer starts, so the transfer does not wait for them.
    const getAvailableAttributes = useCallback(() => {
        const { insight, enableComputedAttributes } = stateRef.current;
        if (!availableAttributes.current) {
            const load = insight
                ? loadInsightAvailableAttributes(backend, workspace, insight, enableComputedAttributes)
                : Promise.resolve([]);
            // A failed load is not cached, so the next transfer loads the attributes again.
            availableAttributes.current = load.catch((error: unknown) => {
                availableAttributes.current = null;
                throw error;
            });
        }
        return availableAttributes.current;
    }, [backend, workspace]);

    useEffect(() => {
        if (isExplore && widgetRef) {
            // The transfer reports a failure of this preload.
            getAvailableAttributes().catch(() => undefined);
        }
        return () => clearTimeout(retryTimeout.current);
    }, [isExplore, widgetRef, getAvailableAttributes]);

    const transferFilters = useCallback(
        async (run: number) => {
            const attributes = await getAvailableAttributes();
            const { widget, insight, ...rest } = stateRef.current;
            if (!isInsightWidget(widget) || !insight) {
                return;
            }
            const appliedFilters = (await queryAndWaitFor(
                dispatch,
                queryWidgetFilters(widget.ref),
            )) as IFilter[];
            if (run !== latestRun.current) {
                return;
            }

            const filters = buildInsightEditorFilterContext({
                widget,
                insight,
                appliedFilters,
                availableAttributes: attributes,
                attributeFilterConfigsDisplayAsLabelMap: rest.displayAsLabelMap,
                capabilities: rest.capabilities,
                dateFilter: rest.dateFilter,
                isMeasureValueFilterEnabled: rest.isMeasureValueFilterEnabled,
                measureValueFilters: rest.measureValueFilters,
            });
            if (filters.length) {
                if (!apiRef.current) {
                    return;
                }
                apiRef.current.setFilterContext({ filters }, KEEP_FILTER_CONTEXT_ID);
            }
            progress.current.isFilterContextKept = true;
        },
        [getAvailableAttributes, dispatch, apiRef],
    );

    const keepFilterContext = useCallback(async () => {
        const current = progress.current;
        if (!current.isInsightOpened || current.isFilterContextKept) {
            return;
        }
        if (!current.startTime) {
            current.startTime = Date.now();
        }
        if (!widgetRef) {
            // An insight that is not on the dashboard has no dashboard filters.
            return;
        }

        // Only the latest transfer sends its filters, as an earlier one may still wait for data.
        const run = ++latestRun.current;
        try {
            await transferFilters(run);
        } catch (error) {
            // The filters stay not kept, so the next render of the insight tries again.
            console.error("The dashboard filters cannot pass to Analytical Designer.", error);
            if (run === latestRun.current && !current.isFailureReported) {
                current.isFailureReported = true;
                addWarning(messages.failed, { duration: TOAST_DURATION_MS });
            }
        }
    }, [widgetRef, transferFilters, addWarning]);

    const onInsightOpened = useCallback(() => {
        if (!isExplore) {
            return;
        }
        progress.current.isInsightOpened = true;
        const { isTimezoneEnabled, timezone } = stateRef.current;
        if (isTimezoneEnabled) {
            // The explored insight executes in the same timezone as the widget.
            const command: AdSetTimezoneCommandData = {
                gdc: {
                    product: GdcProductName.ANALYTICAL_DESIGNER,
                    event: {
                        name: GdcAdCommandType.SetTimezone,
                        data: timezone === undefined ? {} : { timezoneId: timezone },
                    },
                },
            };
            apiRef.current?.sendCommand(command);
        }
    }, [isExplore, apiRef]);

    const onInsightRendered = useCallback(() => {
        if (isExplore) {
            void keepFilterContext();
        }
    }, [isExplore, keepFilterContext]);

    const onCommandFailed = useCallback(
        (data: ICommandFailedBody, contextId?: string) => {
            if (!isExplore || contextId !== KEEP_FILTER_CONTEXT_ID) {
                return;
            }
            progress.current.isFilterContextKept = false;

            if (data.errorCode === GdcErrorType.InvalidArgument) {
                const isInvalidFilterItemsCount =
                    (data.errorMessage?.indexOf("more than 30 attribute") ?? -1) > 0;
                addWarning(
                    isInvalidFilterItemsCount
                        ? messages.invalidFilterItemsCount
                        : messages.dateFilterInapplicable,
                    { duration: TOAST_DURATION_MS },
                );
                return;
            }
            if (Date.now() - progress.current.startTime > MAX_KEEPING_DURATION_MS) {
                addWarning(messages.tookTooLong, { duration: TOAST_DURATION_MS });
                return;
            }
            clearTimeout(retryTimeout.current);
            retryTimeout.current = setTimeout(() => void keepFilterContext(), RETRY_DELAY_MS);
        },
        [isExplore, addWarning, keepFilterContext],
    );

    return useMemo(
        () => ({ onInsightOpened, onInsightRendered, onCommandFailed }),
        [onInsightOpened, onInsightRendered, onCommandFailed],
    );
}
