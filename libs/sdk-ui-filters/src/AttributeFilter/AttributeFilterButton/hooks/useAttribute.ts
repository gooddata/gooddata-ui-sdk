// (C) 2022 GoodData Corporation
import { useMemo } from "react";
import { useCancelablePromise } from "@gooddata/sdk-ui";
import { IAttributeMetadataObject } from "@gooddata/sdk-backend-spi";
import { getObjRef } from "../../utils/AttributeFilterUtils";
import stringify from "json-stable-stringify";
import { AttributeFilterButtonContextProps } from "./types";

export const useAttribute = (context: Omit<AttributeFilterButtonContextProps, "filterObjRef">) => {
    const filterObjRef = useMemo(
        () => getObjRef(context.filter, context.identifier),
        [context.filter, context.identifier],
    );

    return useCancelablePromise<IAttributeMetadataObject>(
        {
            promise: async () => {
                const attributes = context.backend.workspace(context.workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(filterObjRef);
                return attributes.getAttribute(displayForm.attribute);
            },
        },
        [stringify(filterObjRef), context.workspace, context.backend, context.identifier],
    );
};
