// (C) 2025 GoodData Corporation

import { useCallback } from "react";

import { ObjRef } from "@gooddata/sdk-model";
import { useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { useAttribute } from "../../hooks/useAttribute.js";
import { useKdaState } from "../../providers/KdaState.js";
import { createNewAttributeFilter } from "../../utils.js";

export function useAddNewAttributeHandler() {
    const attributeFinder = useAttribute();
    const { state, setState } = useKdaState();
    const id = useIdPrefixed("attr_id_");

    const onSelectCallback = useCallback(
        (ref: ObjRef) => {
            const attr = attributeFinder(ref);

            if (attr) {
                setState({
                    attributeFilters: [
                        ...state.attributeFilters,
                        createNewAttributeFilter(attr, attr.defaultDisplayForm, id),
                    ],
                });
            }
        },
        [attributeFinder, id, setState, state.attributeFilters],
    );

    return {
        onSelectCallback,
    };
}
