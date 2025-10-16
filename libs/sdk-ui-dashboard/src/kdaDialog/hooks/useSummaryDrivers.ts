// (C) 2025 GoodData Corporation

import { useMemo } from "react";

import { ObjRef, objRefToString } from "@gooddata/sdk-model";

import { KdaItemGroup } from "../internalTypes.js";
import { useAttribute } from "./useAttribute.js";
import { useKdaState } from "../providers/KdaState.js";

export function useSummaryDrivers() {
    const { state } = useKdaState();
    const attributeFinder = useAttribute();

    return useMemo(() => {
        //Groups
        const groups = state.items.reduce<Record<string, KdaItemGroup>>((prev, { data }) => {
            const ref = objRefToString(data.attribute);
            if (!prev[ref]) {
                prev[ref] = createKdaGroup(ref, data.attribute, data.title, data.description);
            }
            prev[ref].items.push(data);
            return prev;
        }, {});

        //Selected fill empty groups
        state.selectedAttributes.reduce((prev, current) => {
            const ref = objRefToString(current);
            if (!prev[ref]) {
                const attribute = attributeFinder(current);
                if (attribute) {
                    prev[ref] = createKdaGroup(
                        ref,
                        current,
                        attribute.attribute.title,
                        attribute.attribute.description,
                    );
                }
            }
            return prev;
        }, groups);

        return Object.values(groups).sort((a, b) => b.items.length - a.items.length) as KdaItemGroup[];
    }, [state.items, attributeFinder, state.selectedAttributes]);
}

function createKdaGroup(id: string, attribute: ObjRef, title: string, description: string): KdaItemGroup {
    return {
        id,
        items: [],
        attribute,
        title,
        description,
    };
}
