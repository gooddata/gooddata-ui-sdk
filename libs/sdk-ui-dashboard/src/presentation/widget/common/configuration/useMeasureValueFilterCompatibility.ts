// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IDashboardMeasureValueFilter,
    type IInsightDefinition,
    type IWidget,
    type ObjRef,
    areObjRefsEqual,
    insightMeasures,
    isInsightWidget,
    measureItem,
    objRefToString,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";
import { useDashboardSelector } from "../../../../model/react/DashboardStoreProvider.js";
import { selectInsightByRef } from "../../../../model/store/insights/insightsSelectors.js";

export function useMeasureValueFilterCompatibility(widget: IWidget, filters: IDashboardMeasureValueFilter[]) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    const insight = useDashboardSelector(
        selectInsightByRef(isInsightWidget(widget) ? widget.insight : undefined),
    );

    const measureRefs = useMemo(
        () => filters.map((filter) => filter.dashboardMeasureValueFilter.measure),
        [filters],
    );
    const measureRefsDigest = useMemo(() => measureRefs.map(objRefToString).join("|"), [measureRefs]);

    const { result: compatibleMeasureRefs, status } = useCancelablePromise(
        {
            promise: async () => {
                if (!measureRefs.length) {
                    return [];
                }

                if (!isInsightWidget(widget) || !insight) {
                    return measureRefs;
                }

                return loadCompatibleMeasureRefs(backend, workspace, insight, measureRefs);
            },
        },
        [
            backend,
            workspace,
            measureRefsDigest,
            safeSerializeObjRef(isInsightWidget(widget) ? widget.insight : undefined),
            insight,
        ],
    );

    return {
        status,
        isCompatible: (measureRef: ObjRef) =>
            !compatibleMeasureRefs ||
            compatibleMeasureRefs.some((compatibleMeasureRef) =>
                areObjRefsEqual(compatibleMeasureRef, measureRef),
            ),
    };
}

async function loadCompatibleMeasureRefs(
    backend: ReturnType<typeof useBackendStrict>,
    workspace: string,
    insight: IInsightDefinition,
    measureRefs: ObjRef[],
) {
    const catalog = await backend
        .workspace(workspace)
        .catalog()
        .withGroups(false)
        .forTypes(["measure"])
        .load();
    const availableCatalog = await catalog.availableItems().forTypes(["measure"]).forInsight(insight).load();
    const insightMeasureRefs = insightMeasures(insight)
        .map(measureItem)
        .filter((ref): ref is ObjRef => !!ref);

    const availableMeasureRefs = availableCatalog.availableMeasures().map((measure) => measure.measure.ref);
    const validMeasureRefs = [...availableMeasureRefs, ...insightMeasureRefs];

    return measureRefs.filter((measureRef) =>
        validMeasureRefs.some((validMeasureRef) => areObjRefsEqual(validMeasureRef, measureRef)),
    );
}
