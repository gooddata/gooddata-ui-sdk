// (C) 2026 GoodData Corporation

import { type PropsWithChildren, useMemo } from "react";

import type { ISemanticQualityIssue } from "@gooddata/sdk-model";

import { type IQualityState, QualityStateContext, defaultQualityState } from "./QualityContext.js";

type Props = PropsWithChildren<{
    issues?: ISemanticQualityIssue[];
}>;

/**
 * Test-only QualityProvider holding a fixed, already-loaded report, so a test can exercise the
 * quality-derived filters without a backend serving the report.
 *
 * Memoized on `issues`' identity for the same reason as `TestFilterProvider`.
 * @internal
 */
export function TestQualityProvider({ children, issues }: Props) {
    const value = useMemo<IQualityState>(
        () => ({
            ...defaultQualityState,
            status: "success",
            issues: issues ?? defaultQualityState.issues,
        }),
        [issues],
    );

    return <QualityStateContext.Provider value={value}>{children}</QualityStateContext.Provider>;
}
