// (C) 2025 GoodData Corporation

import { LoadingComponent as DefaultLoadingComponent } from "@gooddata/sdk-ui";

import { usePivotTableProps } from "../../next/context/PivotTablePropsContext.js";

/**
 * Pivot table next loading component.
 *
 * @alpha
 */
export function LoadingComponent() {
    const { LoadingComponent } = usePivotTableProps();
    const Loading = LoadingComponent || DefaultLoadingComponent;

    return <Loading />;
}
