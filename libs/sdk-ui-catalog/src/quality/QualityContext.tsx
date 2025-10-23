// (C) 2025 GoodData Corporation

import { type PropsWithChildren, createContext, useCallback, useContext, useMemo, useState } from "react";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { ISemanticQualityIssue, ISemanticQualityReport, Identifier } from "@gooddata/sdk-model";
import { type UseCancelablePromiseStatus, useCancelablePromise } from "@gooddata/sdk-ui";

import { createQueryId, getQualityReportQuery, triggerQualityIssuesCalculationQuery } from "./query.js";
import { useFeatureFlag } from "../permission/index.js";

interface IQualityState {
    qualityReport: ISemanticQualityReport & {
        status: UseCancelablePromiseStatus;
    };
    qualityIssuesCalculation: {
        status: UseCancelablePromiseStatus;
    };
}

interface IQualityActions {
    fetchQualityReport: () => void;
    createQualityIssuesCalculation: () => void;
}

const initialState: IQualityState = {
    qualityReport: {
        status: "pending",
        issues: [],
        updatedAt: undefined,
    },
    qualityIssuesCalculation: {
        status: "pending",
    },
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

    // Quality issues
    const [qualityIssuesQueryKey, setQualityIssuesQueryKey] = useState<string>(createQueryId);

    const qualityReport = useCancelablePromise(
        {
            promise: enabled ? () => getQualityReportQuery({ backend, workspace }) : null,
            onError: (error) => console.error(error),
        },
        [backend, workspace, enabled, qualityIssuesQueryKey],
    );

    const fetchQualityReport = useCallback(() => {
        setQualityIssuesQueryKey(createQueryId());
    }, []);

    // Quality issues calculation
    const [qualityIssuesCalculationQueryKey, setQualityIssuesCalculationQueryKey] = useState<
        string | undefined
    >(undefined);

    const qualityIssuesCalculation = useCancelablePromise(
        {
            promise:
                enabled && qualityIssuesCalculationQueryKey
                    ? () => triggerQualityIssuesCalculationQuery({ backend, workspace })
                    : null,
            onError: (error) => console.error(error),
        },
        [backend, workspace, enabled, qualityIssuesCalculationQueryKey],
    );

    const createQualityIssuesCalculation = useCallback(() => {
        setQualityIssuesCalculationQueryKey(createQueryId());
        setQualityIssuesQueryKey(createQueryId()); // Temporary
    }, []);

    // Exposed state
    const state = useMemo(
        () => ({
            qualityReport: {
                status: qualityReport.status,
                issues: qualityReport.result?.issues ?? initialState.qualityReport.issues,
                updatedAt: qualityReport.result?.updatedAt,
            },
            qualityIssuesCalculation: {
                status: qualityIssuesCalculation.status,
            },
        }),
        [qualityReport, qualityIssuesCalculation.status],
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

export function useQualityReportState(): IQualityState["qualityReport"] {
    return useQualityState().qualityReport;
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
