// (C) 2022 GoodData Corporation
import { useMemo } from "react";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import {
    ICatalogDateDataset,
    idRef,
    IInsightDefinition,
    IInsightWidget,
    IKpiWidget,
    newBucket,
    newInsightDefinition,
    newMeasure,
    ObjRef,
} from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    UseCancelablePromiseState,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import invariant from "ts-invariant";

import {
    ObjectAvailabilityConfig,
    selectInsightByRef,
    selectObjectAvailabilityConfig,
    useDashboardSelector,
} from "../../../model";

async function loadDateDataSets(
    backend: IAnalyticalBackend,
    workspace: string,
    insight: IInsightDefinition,
    tagsConfiguration: ObjectAvailabilityConfig,
) {
    const { excludeObjectsWithTags = [], includeObjectsWithTags = [] } = tagsConfiguration;

    const dateDataSetsCatalog = await backend.workspace(workspace).catalog().forTypes(["dateDataset"]).load();

    const availableDateDataSetsLoader = dateDataSetsCatalog.availableItems().withOptions({
        types: ["dateDataset"],
        insight,
        excludeTags: excludeObjectsWithTags.map((tag) => idRef(tag)),
        includeTags: includeObjectsWithTags.map((tag) => idRef(tag)),
    });

    const loadedAvailableDateDataSets = await availableDateDataSetsLoader.load();
    return loadedAvailableDateDataSets.availableDateDatasets();
}

function getOneMetricToInsight(metricRef: ObjRef): IInsightDefinition {
    return newInsightDefinition("local:headline", (i) =>
        i.title("").buckets([newBucket("measures", newMeasure(metricRef))]),
    );
}

export function useKpiWidgetRelatedDateDatasets(
    kpiWidget: IKpiWidget,
): UseCancelablePromiseState<ICatalogDateDataset[], GoodDataSdkError> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const tagsConfiguration = useDashboardSelector(selectObjectAvailabilityConfig);
    const metricRef = kpiWidget.kpi.metric;
    const insight = useMemo(() => getOneMetricToInsight(metricRef), [metricRef]);

    return useCancelablePromise(
        {
            promise: () => {
                return loadDateDataSets(backend, workspace, insight, tagsConfiguration);
            },
        },
        [backend, workspace, insight, tagsConfiguration],
    );
}

export function useInsightWidgetRelatedDateDatasets(
    insightWidget: IInsightWidget,
): UseCancelablePromiseState<ICatalogDateDataset[], GoodDataSdkError> {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const tagsConfiguration = useDashboardSelector(selectObjectAvailabilityConfig);
    const insight = useDashboardSelector(selectInsightByRef(insightWidget.insight));
    invariant(insight, "Inconsistent state in useInsightWidgetRelatedDateDatasets");

    return useCancelablePromise(
        {
            promise: () => {
                return loadDateDataSets(backend, workspace, insight, tagsConfiguration);
            },
        },
        [backend, workspace, insight, tagsConfiguration],
    );
}
