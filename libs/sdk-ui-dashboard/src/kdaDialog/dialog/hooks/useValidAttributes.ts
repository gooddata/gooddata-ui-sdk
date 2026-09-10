// (C) 2025-2026 GoodData Corporation

import { useEffect } from "react";

import { type IMeasure } from "@gooddata/sdk-model";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { isComputedAttributesUnavailableError } from "../../../_staging/catalog/computedAttributes.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectEnableComputedAttributes } from "../../../model/store/config/configSelectors.js";
import { useKdaState } from "../../providers/KdaState.js";
import { type DeepReadonly, type IKdaDefinition } from "../../types.js";

export function useValidAttributes() {
    const { state, setState } = useKdaState();
    const definition = state.definition;

    const { result, status } = useValidObjectsResults(definition);

    useEffect(() => {
        setState({
            relevantAttributes: result ?? [],
            relevantStatus: status,
        });
    }, [result, setState, status]);
}

function useValidObjectsResults(definition: DeepReadonly<IKdaDefinition> | null) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();
    // asking for computed attributes is gated by the enableComputedAttributes setting because a
    // backend with the setting off refuses the computed-attributes flavour of the request outright
    const includeComputedAttributes = useDashboardSelector(selectEnableComputedAttributes);
    const metric = definition?.metric;
    const metrics = definition?.metrics;

    return useCancelablePromise(
        {
            promise: metric
                ? async () => {
                      const measures = backend.workspace(workspace).measures();
                      try {
                          return await measures.getConnectedAttributes(
                              metric as IMeasure,
                              metrics as IMeasure[],
                              { includeComputedAttributes },
                          );
                      } catch (error) {
                          // when the backend refuses computed attributes (a race with the setting
                          // being turned off, an older backend), fall back to plain attributes; a
                          // genuine failure propagates
                          if (!includeComputedAttributes || !isComputedAttributesUnavailableError(error)) {
                              throw error;
                          }
                          return measures.getConnectedAttributes(metric as IMeasure, metrics as IMeasure[]);
                      }
                  }
                : undefined,
        },
        [backend, workspace, metric, metrics, includeComputedAttributes],
    );
}
