// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssue, ISemanticQualityReport, Identifier } from "@gooddata/sdk-model";
import { type UseCancelablePromiseStatus, useCancelablePromise } from "@gooddata/sdk-ui";

import { createQueryId, getQualityReportQuery, triggerQualityIssuesCalculationQuery } from "./query.js";
import { useFeatureFlag } from "../permission/index.js";

type QualityQueryType = "fetch" | "trigger";

interface IQualityState {
    status: UseCancelablePromiseStatus;
    issues: ISemanticQualityIssue[];
    updatedAt: ISemanticQualityReport["updatedAt"];
    reportStatus: ISemanticQualityReport["status"];
}

interface IQualityActions {
    fetchQualityReport: () => void;
    createQualityIssuesCalculation: () => void;
}

const initialState: IQualityState = {
    status: "pending",
    issues: [],
    updatedAt: undefined,
    reportStatus: "NOT_FOUND",
};
const initialActions: IQualityActions = {
    fetchQualityReport: () => {},
    createQualityIssuesCalculation: () => {},
};

const QualityStateContext = createContext<IQualityState>(initialState);
const QualityActionsContext = createContext<IQualityActions>(initialActions);

type Props = PropsWithChildren<{
    backend: IAnalyticalBackend;
    workspace: string;
}>;

export function QualityProvider({ backend, workspace, children }: Props) {
    const enabled = useFeatureFlag("enableGenAICatalogQualityChecker");

    const [queryType, setQueryType] = useState<QualityQueryType>("fetch");
    const [queryKey, setQueryKey] = useState<string>(createQueryId);

    const qualityReport = useCancelablePromise(
        {
            promise: enabled
                ? (signal) => {
                      if (queryType === "trigger") {
                          return triggerQualityIssuesCalculationQuery({ backend, workspace, signal });
                      }
                      return getQualityReportQuery({ backend, workspace, signal });
                  }
                : null,
            onError: (error) => console.error(error),
            enableAbortController: true,
        },
        [backend, workspace, enabled, queryType, queryKey],
    );

    const fetchQualityReport = useCallback(() => {
        setQueryType("fetch");
        setQueryKey(createQueryId());
    }, []);

    const createQualityIssuesCalculation = useCallback(() => {
        setQueryType("trigger");
        setQueryKey(createQueryId());
    }, []);

    // Exposed state
    const state = useMemo(
        () => ({
            status: qualityReport.status,
            issues: qualityReport.result?.issues ?? initialState.issues,
            updatedAt: qualityReport.result?.updatedAt,
            reportStatus: qualityReport.result?.status ?? initialState.reportStatus,
        }),
        [qualityReport],
    );

    // Exposed actions
    const actions = useMemo(
        () => ({ fetchQualityReport, createQualityIssuesCalculation }),
        [fetchQualityReport, createQualityIssuesCalculation],
    );

    return (
        <QualityStateContext.Provider value={state}>
            <QualityActionsContext.Provider value={actions}>{children}</QualityActionsContext.Provider>
        </QualityStateContext.Provider>
    );
}

export function useQualityState(): IQualityState {
    return useContext(QualityStateContext);
}

export function useQualityReportState(): IQualityState {
    return useQualityState();
}

export function useQualityActions(): IQualityActions {
    return useContext(QualityActionsContext);
}

export function useQualityIssuesMap(): Map<Identifier, ISemanticQualityIssue[]> {
    const { issues } = useQualityReportState();

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
