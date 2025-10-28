// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import {
    IResultAttributeHeader,
    areObjRefsEqual,
    isAttributeDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";
import { IDrillEvent } from "@gooddata/sdk-ui";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { useAttribute } from "../../hooks/useAttribute.js";
import { useKdaState } from "../../providers/KdaState.js";
import { createNewAttributeFilter, updateExistingAttributeFilter } from "../../utils.js";

export function useDrillAttributeHandler() {
    const { state, setState } = useKdaState();
    const attributeFinder = useAttribute();
    const id = useIdPrefixed("attr_id_");

    const onDrillCallback = useCallback(
        (event: IDrillEvent) => {
            const attribute = event.drillContext.intersection
                ?.map((i) => i.header)
                .filter(isAttributeDescriptor)[0];
            const attributeItem = event.drillContext.intersection
                ?.map((i) => i.header)
                .filter(isResultAttributeHeader)[0] as IResultAttributeHeader | undefined;

            if (!attribute) {
                return;
            }
            if (!attributeItem) {
                return;
            }

            const currentFilters = state.attributeFilters;
            const catalogAttribute = attributeFinder(attribute.attributeHeader.ref);

            if (!catalogAttribute) {
                return;
            }

            const found = currentFilters.find(
                (f) =>
                    areObjRefsEqual(f.attributeFilter.displayForm, catalogAttribute.attribute.ref) ||
                    catalogAttribute.displayForms.some((df) =>
                        areObjRefsEqual(df.ref, f.attributeFilter.displayForm),
                    ),
            );

            const value = attributeItem.attributeHeaderItem.uri;
            if (found) {
                const newFilters = state.attributeFilters.map((f) => {
                    if (found === f) {
                        return updateExistingAttributeFilter(f, value);
                    }
                    return f;
                });
                setState({
                    attributeFilters: newFilters,
                });
            } else {
                setState({
                    attributeFilters: [
                        ...state.attributeFilters,
                        createNewAttributeFilter(catalogAttribute, id, value),
                    ],
                });
            }
        },
        [attributeFinder, id, setState, state.attributeFilters],
    );

    return {
        onDrillCallback,
    };
}
