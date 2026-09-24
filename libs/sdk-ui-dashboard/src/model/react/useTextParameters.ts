// (C) 2026 GoodData Corporation

import { useEffect, useMemo } from "react";

import { type IExecutionConfig, type IInsight, type ObjRef, serializeObjRef } from "@gooddata/sdk-model";

import { collectTextReferenceRoots } from "../commandHandlers/parameters/dashboardParameterRoots.js";
import { insightRoots } from "../commandHandlers/parameters/loadParameterDependencies.js";
import { requestParameterDependencies } from "../commandHandlers/parameters/parameterDependenciesWorker.js";
import {
    selectCatalogParametersIsLoaded,
    selectCatalogRequestedParameterRoots,
} from "../store/catalog/catalogSelectors.js";
import {
    resolveEffectiveParameterValuesForRoots,
    resolveParameterDisplayValues,
} from "../store/tabs/parameters/parametersHelpers.js";
import { selectWidgetParameterContext } from "../store/tabs/parameters/parametersSelectors.js";

import { useDashboardDispatch, useDashboardSelector } from "./DashboardStoreProvider.js";
import { useDashboardExecConfig } from "./useWidgetExecConfig.js";

/**
 * @internal
 */
export interface ITextParameters {
    execConfig: IExecutionConfig;
    parameterDisplayValues: ReadonlyMap<string, string> | undefined;
    loading: boolean;
}

/**
 * What a text needs from the parameters of the dashboard.
 *
 * `execConfig` is the execution config for the references the text resolves: the dashboard-level
 * settings plus the parameters the referenced metrics and computed attributes depend on, so a number
 * in a text reads the same as the chart beside it.
 *
 * `parameterDisplayValues` is the text every parameter shows in a `{parameter/<id>}` reference, by
 * parameter identifier. It is `undefined` where the dashboard resolves no parameters at all, or where
 * the workspace parameters did not load, so the host passes nothing on and the token stays as it was
 * typed. A failed load must not show every parameter as unknown.
 *
 * `loading` is true while a root the text references, or a root of a dashboard filter that applies to
 * the text, is neither in the map nor marked failed. The host defers the execution until then, so a
 * reference is never executed without the parameters it depends on and then executed again with them.
 *
 * @param content - the text whose references are executed
 * @param ref - the widget hosting the text; `undefined` for a host outside any widget, which takes
 *   the active tab
 * @param insight - the insight the host shows, whose authored values take part in the resolution and
 *   whose own filters the text executes under, so its dependencies apply too
 * @internal
 */
export function useTextParameters(content: string, ref?: ObjRef, insight?: IInsight): ITextParameters {
    const dashboardExecConfig = useDashboardExecConfig();
    const parameterContext = useDashboardSelector(selectWidgetParameterContext(ref));
    const requestedRoots = useDashboardSelector(selectCatalogRequestedParameterRoots);
    const isCatalogLoaded = useDashboardSelector(selectCatalogParametersIsLoaded);
    const dispatch = useDashboardDispatch();
    // the host executes the text under the insight's own filters, so the text depends on whatever
    // the insight depends on, the same root the chart resolves
    const roots = useMemo(
        () =>
            insight
                ? [...collectTextReferenceRoots(content), ...insightRoots([insight])]
                : collectTextReferenceRoots(content),
        [content, insight],
    );
    const missingRoots = useMemo(
        () =>
            parameterContext
                ? [...roots, ...parameterContext.filterRoots].filter(
                      (root) => !(serializeObjRef(root) in parameterContext.dependenciesByRoot),
                  )
                : [],
        [roots, parameterContext],
    );

    // a text edited here, shown for an insight the dashboard did not load with, or under a filter
    // added later has roots the initial references call never saw; the worker loads them
    useEffect(() => {
        const rootsToRequest = missingRoots.filter((root) => !(serializeObjRef(root) in requestedRoots));
        if (rootsToRequest.length > 0) {
            dispatch(requestParameterDependencies(rootsToRequest));
        }
    }, [missingRoots, requestedRoots, dispatch]);

    const parameterValues = useMemo(
        () => resolveEffectiveParameterValuesForRoots(parameterContext, roots, insight),
        [parameterContext, roots, insight],
    );
    const execConfig = useMemo(
        () => ({
            ...dashboardExecConfig,
            // omit when empty so it does not bust the execution's defFingerprint
            ...(parameterValues.length > 0 ? { parameterValues } : {}),
        }),
        [dashboardExecConfig, parameterValues],
    );
    const parameterDisplayValues = useMemo(
        () =>
            parameterContext && isCatalogLoaded
                ? resolveParameterDisplayValues(parameterContext, insight)
                : undefined,
        [parameterContext, isCatalogLoaded, insight],
    );
    const loading = useMemo(
        () => missingRoots.some((root) => requestedRoots[serializeObjRef(root)] !== "failed"),
        [missingRoots, requestedRoots],
    );
    return useMemo(
        () => ({ execConfig, parameterDisplayValues, loading }),
        [execConfig, parameterDisplayValues, loading],
    );
}
