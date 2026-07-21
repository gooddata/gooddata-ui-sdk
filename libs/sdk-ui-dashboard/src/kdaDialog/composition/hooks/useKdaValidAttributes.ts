// (C) 2025-2026 GoodData Corporation

import { useMemo } from "react";

import { type ICatalogAttribute, areObjRefsEqual } from "@gooddata/sdk-model";

import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectCatalogAttributes } from "../../../model/store/catalog/catalogSelectors.js";
import { useSummaryDrivers } from "../../hooks/useSummaryDrivers.js";
import { type IKdaItemGroup } from "../../internalTypes.js";
import { useKdaState } from "../../providers/KdaState.js";

const SEARCH_BAR_THRESHOLD = 7;

export function useKdaValidAttributes() {
    const { state } = useKdaState();
    const list = useSummaryDrivers();
    const allAttributes = useDashboardSelector(selectCatalogAttributes);

    const { validAttributes, mapAttributes } = useMemo(() => {
        const mapAttributes = new Map<string, IKdaItemGroup | undefined>();
        const validAttributes = allAttributes
            .filter((a) => {
                return state.relevantAttributes.some((attr) => areObjRefsEqual(attr, a.attribute.ref));
            })
            .map((a) => {
                const group = list.find((item) =>
                    a.displayForms.some((df) => areObjRefsEqual(df.ref, item.displayForm)),
                );
                mapAttributes.set(a.attribute.id, group);
                return [a, group] as const;
            })
            .sort(([, a], [, b]) => {
                const aIndex = a ? list.indexOf(a) : Number.MAX_VALUE;
                const bIndex = b ? list.indexOf(b) : Number.MAX_VALUE;
                return aIndex - bIndex;
            })
            .map(([a]) => a);

        return { validAttributes, mapAttributes };
    }, [allAttributes, list, state.relevantAttributes]);

    const initialAttributes = useMemo(() => {
        return state.selectedAttributes
            .map((attr) => {
                return validAttributes.find((a) =>
                    a.displayForms.some((df) => areObjRefsEqual(df.ref, attr)),
                );
            })
            .filter((a): a is ICatalogAttribute => a !== undefined);
    }, [state.selectedAttributes, validAttributes]);

    return {
        validAttributes,
        mapAttributes,
        initialAttributes,
        isSearchBarVisible: validAttributes.length > SEARCH_BAR_THRESHOLD,
    };
}
