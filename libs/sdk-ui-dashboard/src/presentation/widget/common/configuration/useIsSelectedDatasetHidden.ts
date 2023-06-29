// (C) 2022 GoodData Corporation
import { useMemo } from "react";
import { areObjRefsEqual, idRef, ObjRef } from "@gooddata/sdk-model";

import {
    useDashboardSelector,
    selectObjectAvailabilityConfig,
    selectCatalogDateDatasets,
} from "../../../../model/index.js";
import { useBackendStrict, useCancelablePromise, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { safeSerializeObjRef } from "../../../../_staging/metadata/safeSerializeObjRef.js";

export function useIsSelectedDatasetHidden(selectedDateDatasetRef: ObjRef | undefined) {
    const backend = useBackendStrict();
    const workspace = useWorkspaceStrict();

    const allDateDatasets = useDashboardSelector(selectCatalogDateDatasets);
    const objectAvailability = useDashboardSelector(selectObjectAvailabilityConfig);

    const hasObjectAvailability = !!(
        objectAvailability.excludeObjectsWithTags?.length || objectAvailability.includeObjectsWithTags?.length
    );

    const { result: visibleDateDatasets, status } = useCancelablePromise(
        {
            promise: hasObjectAvailability
                ? async () => {
                      const catalog = await backend
                          .workspace(workspace)
                          .catalog()
                          .withGroups(false)
                          .forTypes(["dateDataset"])
                          .excludeTags(
                              (objectAvailability.excludeObjectsWithTags ?? []).map((tag) => idRef(tag)),
                          )
                          .includeTags(
                              (objectAvailability.includeObjectsWithTags ?? []).map((tag) => idRef(tag)),
                          )
                          .load();

                      return catalog.dateDatasets();
                  }
                : () => Promise.resolve(allDateDatasets),
        },
        [backend, workspace, objectAvailability],
    );

    const selectedDateDatasetHiddenByObjectAvailability = useMemo(() => {
        if (!visibleDateDatasets || !selectedDateDatasetRef) {
            return false;
        }

        return !visibleDateDatasets.some((ds) => areObjRefsEqual(selectedDateDatasetRef, ds.dataSet.ref));
    }, [safeSerializeObjRef(selectedDateDatasetRef), visibleDateDatasets]);

    return {
        selectedDateDatasetHiddenByObjectAvailability,
        status,
    };
}
