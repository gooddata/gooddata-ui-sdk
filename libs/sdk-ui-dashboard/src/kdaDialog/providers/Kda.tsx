// (C) 2025-2026 GoodData Corporation

import { type ReactNode, useMemo } from "react";

import { type ISeparators, isAllValuesDashboardAttributeFilter } from "@gooddata/sdk-model";

import { KdaStateProvider } from "./KdaState.js";
import { type IKdaState } from "../internalTypes.js";
import { type IKdaDefinition } from "../types.js";

export interface IKdaProps {
    children: ReactNode;
    definition: IKdaDefinition;
    separators?: ISeparators;
    includeTags?: string[];
    excludeTags?: string[];
}

export function KdaProvider({ children, definition, separators, includeTags, excludeTags }: IKdaProps) {
    const state = useMemo((): Partial<IKdaState> => {
        return {
            separators,
            definition,
            includeTags,
            excludeTags,
            fromValue: { ...definition?.range[0] },
            toValue: { ...definition?.range[1] },
            definitionStatus: "success",
            isMinimized: true,
            attributeFilters: (definition.filters?.slice() ?? []).filter(
                (f) => !isAllValuesDashboardAttributeFilter(f),
            ),
        };
    }, [definition, separators, includeTags, excludeTags]);

    return <KdaStateProvider value={state}>{children}</KdaStateProvider>;
}
