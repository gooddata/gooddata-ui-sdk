// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useContext, useMemo } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssue, Identifier, SemanticQualityIssueCode } from "@gooddata/sdk-model";
import { type UseCancelablePromiseStatus, useCancelablePromise } from "@gooddata/sdk-ui";

import { getQualityIssuesQuery } from "./query.js";
import { useFeatureFlag } from "../permission/index.js";

interface IQualityState {
    status: UseCancelablePromiseStatus;
    issues: ISemanticQualityIssue[];
}

const initialState: IQualityState = {
    status: "pending",
    issues: [],
};

export const QualityStateContext = createContext<IQualityState>(initialState);

type Props = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

export function QualityProvider({ backend, workspace, children }: Props) {
    const enabled = useFeatureFlag("enableGenAICatalogQualityChecker");

    const { status, result: issues = initialState.issues } = useCancelablePromise(
        {
            promise: enabled ? () => getQualityIssuesQuery({ backend, workspace }) : null,
            onError: (error) => console.error(error),
        },
        [backend, workspace, enabled],
    );

    const state = useMemo(() => ({ status, issues }), [issues, status]);

    return <QualityStateContext.Provider value={state}>{children}</QualityStateContext.Provider>;
}

export function useQualityState(): IQualityState {
    return useContext(QualityStateContext);
}

export function useQualityIssuesMap(): Map<Identifier, ISemanticQualityIssue[]> {
    const { issues } = useQualityState();

    return useMemo(() => {
        const map = new Map<Identifier, ISemanticQualityIssue[]>();

        for (const issue of issues) {
            for (const { identifier } of issue.objects) {
                const existingIssue = map.get(identifier);
                if (existingIssue) {
                    existingIssue.push(issue);
                } else {
                    map.set(identifier, [issue]);
                }
            }
        }

        return map;
    }, [issues]);
}

export function useQualityIssuesById(id: Identifier): ISemanticQualityIssue[] | undefined {
    const map = useQualityIssuesMap();
    return map.get(id);
}

export function useQualityIssuesMapGroupedByCode(
    id: Identifier,
): Map<SemanticQualityIssueCode, ISemanticQualityIssue[]> | undefined {
    const issues = useQualityIssuesById(id);

    return useMemo(() => {
        if (!issues?.length) {
            return undefined;
        }

        const groupMap = new Map<SemanticQualityIssueCode, ISemanticQualityIssue[]>();

        for (const issue of issues) {
            const existingIssue = groupMap.get(issue.code);
            if (existingIssue) {
                existingIssue.push(issue);
            } else {
                groupMap.set(issue.code, [issue]);
            }
        }

        return groupMap;
    }, [issues]);
}
