// (C) 2025 GoodData Corporation

import { ReactNode, useMemo } from "react";

import { ISeparators, isAllValuesDashboardAttributeFilter } from "@gooddata/sdk-model";

import { KdaStateProvider } from "./KdaState.js";
import { KdaState } from "../internalTypes.js";
import { IKdaDefinition } from "../types.js";

export interface KdaProps {
    children: ReactNode;
    definition: IKdaDefinition;
    separators?: ISeparators;
}

export function KdaProvider({ children, definition, separators }: KdaProps) {
    const state = useMemo((): Partial<KdaState> => {
        return {
            separators,
            definition,
            fromValue: { ...definition?.range[0] },
            toValue: { ...definition?.range[1] },
            definitionStatus: "success",
            attributeFilters: (definition.filters?.slice() ?? []).filter(
                (f) => !isAllValuesDashboardAttributeFilter(f),
            ),
        };
    }, [definition, separators]);

    return <KdaStateProvider value={state}>{children}</KdaStateProvider>;
}
