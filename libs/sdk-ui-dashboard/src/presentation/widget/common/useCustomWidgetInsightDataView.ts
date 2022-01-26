// (C) 2022 GoodData Corporation
import { useMemo } from "react";
import { IInsightDefinition, insightSetFilters, isInsight, ObjRef } from "@gooddata/sdk-model";
import {
    DataViewFacade,
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useExecutionDataView,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import stringify from "json-stable-stringify";

import { ICustomWidget } from "../../../model";

import { useWidgetFilters } from "./useWidgetFilters";

/**
 * Configuration options for the {@link useCustomWidgetInsightDataView} hook.
 *
 * @beta
 */
export interface IUseCustomWidgetInsightDataViewConfig {
    /**
     * Custom widget in the context of which the execution should be run. This affects which filters will be used.
     */
    widget: ICustomWidget;
    /**
     * Insight to execute or a reference to it. The filters will be automatically merged with the filters on the dashboard.
     *
     * Note: When the insight is not provided, hook is locked in a "pending" state.
     */
    insight?: IInsightDefinition | ObjRef;
}

/**
 * This hook provides an easy way to read a data view for an insight from a custom widget.
 * It resolves the appropriate filters for the widget based on the filters currently set on the whole dashboard.
 *
 * @beta
 */
export const useCustomWidgetInsightDataView = ({
    widget,
    insight,
}: IUseCustomWidgetInsightDataViewConfig): UseCancelablePromiseState<DataViewFacade, GoodDataSdkError> => {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const {
        result: effectiveInsight,
        error: insightError,
        status: insightStatus,
    } = useCancelablePromise(
        {
            promise: insight
                ? async () => {
                      return isInsight(insight)
                          ? insight
                          : backend
                                .workspace(workspace)
                                .insights()
                                .getInsight(insight as ObjRef);
                  }
                : null,
        },
        [backend, workspace, insight],
    );

    const {
        result: filters,
        status: filtersStatus,
        error: filtersError,
    } = useWidgetFilters(
        // only pass the widget in when the insight is ready to not start the filter query while the insight is loading
        effectiveInsight ? widget : undefined,
        effectiveInsight,
    );

    const insightWithAddedFilters = useMemo(
        () => (effectiveInsight ? insightSetFilters(effectiveInsight, filters) : undefined),
        [
            effectiveInsight,
            /**
             * We use stringified value to avoid setting equal filters. This prevents cascading cache invalidation
             * and expensive re-renders down the line. The stringification is worth it as the filters are usually
             * pretty small thus saving more time than it is taking.
             */
            stringify(filters),
        ],
    );

    const insightExecution = useMemo(() => {
        return insightWithAddedFilters
            ? backend.workspace(workspace).execution().forInsight(insightWithAddedFilters)
            : undefined;
    }, [backend, workspace, insightWithAddedFilters, widget]);

    const { result, error, status } = useExecutionDataView({
        execution: insightExecution,
    });

    // insight non-success status has precedence, other things cannot run without an insight
    if (insightStatus !== "success") {
        return {
            error: insightError,
            result: undefined,
            status: insightStatus,
        };
    }

    if (!filtersStatus || status === "pending") {
        return {
            error: undefined,
            result: undefined,
            status: "pending",
        };
    }

    if (filtersStatus === "running" || status === "loading") {
        return {
            error: undefined,
            result: undefined,
            status: "loading",
        };
    }

    if (filtersError || error) {
        return {
            error: (error ?? filtersError)!,
            result: undefined,
            status: "error",
        };
    }

    return {
        error: undefined,
        result: result!,
        status: "success",
    };
};
