// (C) 2026 GoodData Corporation

import { useMemo } from "react";

import {
    type IDashboardMeasureValueFilter,
    type IInsight,
    type IInsightDefinition,
    type ObjRef,
    areObjRefsEqual,
    insightBuckets,
    insightFilters,
    insightMeasures,
    isObjRef,
    measureItem,
    objRefToString,
} from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

const COMPATIBLE_MEASURE_REFS_CACHE_SIZE = 50;

const compatibleMeasureRefsCache = new Map<string, ObjRef[]>();
const compatibleMeasureRefsPromises = new Map<string, Promise<ObjRef[]>>();

export function useMeasureValueFilterCompatibility(
    insight: IInsight | undefined,
    filters: IDashboardMeasureValueFilter[],
) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const measureRefs = useMemo(
        () => filters.map((filter) => filter.dashboardMeasureValueFilter.measure),
        [filters],
    );
    const measureRefsDigest = useMemo(() => measureRefs.map(objRefToString).join("|"), [measureRefs]);
    const insightIdentifier = getInsightIdentifier(insight);
    const cacheKey = useMemo(
        () =>
            insight && measureRefs.length
                ? getCompatibleMeasureRefsCacheKey(workspace, insight, measureRefsDigest)
                : undefined,
        [insight, measureRefs.length, measureRefsDigest, workspace],
    );
    const cachedCompatibleMeasureRefs = useMemo(() => {
        if (!measureRefs.length) {
            return [];
        }

        if (!insight) {
            return measureRefs;
        }

        return cacheKey ? getCachedValue(compatibleMeasureRefsCache, cacheKey) : undefined;
    }, [cacheKey, insight, measureRefs]);

    const insightToLoadCompatibleMeasureRefsFor = cachedCompatibleMeasureRefs ? undefined : insight;
    const { result: loadedCompatibleMeasureRefs, status } = useCancelablePromise(
        {
            promise: insightToLoadCompatibleMeasureRefsFor
                ? async () =>
                      loadCompatibleMeasureRefs(
                          backend,
                          workspace,
                          insightToLoadCompatibleMeasureRefsFor,
                          measureRefs,
                      )
                : undefined,
        },
        [
            backend,
            workspace,
            measureRefsDigest,
            insightIdentifier,
            cachedCompatibleMeasureRefs,
            insightToLoadCompatibleMeasureRefsFor,
        ],
    );
    const compatibleMeasureRefs = cachedCompatibleMeasureRefs ?? loadedCompatibleMeasureRefs;
    const compatibleMeasureValueFilters = useMemo(
        () =>
            compatibleMeasureRefs
                ? filters.filter((filter) =>
                      isMeasureRefCompatible(
                          filter.dashboardMeasureValueFilter.measure,
                          compatibleMeasureRefs,
                      ),
                  )
                : filters,
        [compatibleMeasureRefs, filters],
    );

    return {
        status: cachedCompatibleMeasureRefs ? "success" : status,
        isCompatible: (measureRef: ObjRef) => isMeasureRefCompatible(measureRef, compatibleMeasureRefs),
        compatibleMeasureRefs,
        compatibleMeasureValueFilters,
    };
}

function isMeasureRefCompatible(measureRef: ObjRef, compatibleMeasureRefs: ObjRef[] | undefined): boolean {
    return (
        !compatibleMeasureRefs ||
        compatibleMeasureRefs.some((compatibleMeasureRef) =>
            areObjRefsEqual(compatibleMeasureRef, measureRef),
        )
    );
}

export async function loadCompatibleMeasureRefs(
    backend: ReturnType<typeof useBackendStrict>,
    workspace: string,
    insight: IInsightDefinition,
    measureRefs: ObjRef[],
) {
    const cacheKey = getCompatibleMeasureRefsCacheKey(
        workspace,
        insight,
        measureRefs.map(objRefToString).join("|"),
    );
    const cachedCompatibleMeasureRefs = getCachedValue(compatibleMeasureRefsCache, cacheKey);
    if (cachedCompatibleMeasureRefs) {
        return cachedCompatibleMeasureRefs;
    }

    const pendingCompatibleMeasureRefs = getCachedValue(compatibleMeasureRefsPromises, cacheKey);
    if (pendingCompatibleMeasureRefs) {
        return pendingCompatibleMeasureRefs;
    }

    const compatibleMeasureRefsPromise = loadCompatibleMeasureRefsFromBackend(
        backend,
        workspace,
        insight,
        measureRefs,
    )
        .then((compatibleMeasureRefs) => {
            setCachedValue(compatibleMeasureRefsCache, cacheKey, compatibleMeasureRefs);
            return compatibleMeasureRefs;
        })
        .finally(() => {
            compatibleMeasureRefsPromises.delete(cacheKey);
        });

    setCachedValue(compatibleMeasureRefsPromises, cacheKey, compatibleMeasureRefsPromise);
    return compatibleMeasureRefsPromise;
}

async function loadCompatibleMeasureRefsFromBackend(
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

function getCompatibleMeasureRefsCacheKey(
    workspace: string,
    insight: IInsightDefinition,
    measureRefsDigest: string,
) {
    return JSON.stringify([
        workspace,
        getInsightIdentifier(insight),
        insightBuckets(insight),
        insightFilters(insight),
        measureRefsDigest,
    ]);
}

function getInsightIdentifier(insight: IInsightDefinition | undefined) {
    if (!insight) {
        return undefined;
    }

    if ("identifier" in insight.insight && typeof insight.insight.identifier === "string") {
        return insight.insight.identifier;
    }

    if ("ref" in insight.insight && isObjRef(insight.insight.ref)) {
        return objRefToString(insight.insight.ref);
    }

    return undefined;
}

function getCachedValue<T>(cache: Map<string, T>, key: string): T | undefined {
    return cache.get(key);
}

function setCachedValue<T>(cache: Map<string, T>, key: string, value: T): void {
    cache.delete(key);
    cache.set(key, value);

    while (cache.size > COMPATIBLE_MEASURE_REFS_CACHE_SIZE) {
        const oldestKey = cache.keys().next().value;
        if (oldestKey === undefined) {
            return;
        }
        cache.delete(oldestKey);
    }
}
