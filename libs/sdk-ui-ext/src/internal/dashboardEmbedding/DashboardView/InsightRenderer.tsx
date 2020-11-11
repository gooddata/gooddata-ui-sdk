// (C) 2020 GoodData Corporation
import React, { useCallback, useMemo, useState } from "react";
import { IAnalyticalBackend, IWidget } from "@gooddata/sdk-backend-spi";
import { IFilter } from "@gooddata/sdk-model";
import {
    IDrillableItem,
    IErrorProps,
    IHeaderPredicate,
    ILoadingProps,
    IPushData,
    OnError,
    OnFiredDrillEvent,
    useBackend,
    useCancelablePromise,
    useWorkspace,
} from "@gooddata/sdk-ui";
import { InsightView } from "../../../insightView";
import { availableDrillTargetsToDrillPredicates, widgetDrillsToDrillPredicates } from "./convertors";

interface IInsightRendererProps {
    insightWidget: IWidget;
    backend?: IAnalyticalBackend;
    workspace?: string;
    filters?: IFilter[];
    drillableItems?: Array<IDrillableItem | IHeaderPredicate>;
    onDrill?: OnFiredDrillEvent;
    onError?: OnError;
    ErrorComponent: React.ComponentType<IErrorProps>;
    LoadingComponent: React.ComponentType<ILoadingProps>;
}

export const InsightRenderer: React.FC<IInsightRendererProps> = ({
    insightWidget,
    filters,
    drillableItems = [],
    onDrill,
    onError,
    backend,
    workspace,
    ErrorComponent,
    LoadingComponent,
}) => {
    const effectiveBackend = useBackend(backend);
    const effectiveWorkspace = useWorkspace(workspace);

    const { error, result, status } = useCancelablePromise({
        promise: () =>
            effectiveBackend
                .workspace(effectiveWorkspace)
                .dashboards()
                .getResolvedFiltersForWidget(insightWidget, filters ?? []),
        onError,
    });

    const [drillsFromInsight, setDrillsFromInsight] = useState<IHeaderPredicate[]>([]);

    const effectiveDrillableItems: Array<IDrillableItem | IHeaderPredicate> = useMemo(() => {
        const drillsFromWidget = widgetDrillsToDrillPredicates(insightWidget.drills);
        return [
            ...drillsFromWidget, // drills specified in the widget definition
            ...drillableItems, // drills specified by the caller
            ...drillsFromInsight, // drills specified in the insight itself
        ];
    }, [insightWidget.drills, drillableItems, drillsFromInsight]);

    const handlePushData = useCallback((data: IPushData) => {
        if (data.availableDrillTargets) {
            setDrillsFromInsight(availableDrillTargetsToDrillPredicates(data.availableDrillTargets));
        }
    }, []);

    if (status === "loading" || status === "pending") {
        return <LoadingComponent />;
    }

    if (status === "error") {
        return <ErrorComponent message={error.message} />;
    }

    return (
        <InsightView
            insight={insightWidget.insight}
            filters={result}
            backend={backend}
            workspace={workspace}
            drillableItems={effectiveDrillableItems}
            onDrill={onDrill}
            onError={onError}
            pushData={handlePushData}
            ErrorComponent={ErrorComponent}
            LoadingComponent={LoadingComponent}
        />
    );
};
