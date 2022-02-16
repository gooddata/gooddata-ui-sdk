// (C) 2022 GoodData Corporation

import { useCancelablePromise } from "@gooddata/sdk-ui";
import { IAnalyticalBackend, IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import { getObjRef } from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { IAttributeFilter, ObjRef } from "@gooddata/sdk-model";

export const useAttribute = (
    backend: IAnalyticalBackend,
    workspace: string,
    identifier: string,
    currentFilter: IAttributeFilter,
    filterObjRef: ObjRef,
) => {
    return useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = backend.workspace(workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(currentFilter, identifier),
                );
                return attributes.getAttribute(displayForm.attribute);
            },
        },
        [stringify(filterObjRef), workspace, backend, identifier],
    );
};
