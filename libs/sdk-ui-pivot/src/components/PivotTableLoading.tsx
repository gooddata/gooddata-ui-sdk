// (C) 2007-2025 GoodData Corporation

import { type ComponentType, type ReactElement } from "react";

import { type ITheme } from "@gooddata/sdk-model";

export interface IPivotTableLoadingProps {
    LoadingComponent?: ComponentType<{ color?: string }>;
    theme?: ITheme;
}

export function PivotTableLoading({ LoadingComponent, theme }: IPivotTableLoadingProps): ReactElement {
    const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;

    return (
        <div className="s-loading gd-table-loading">
            {LoadingComponent ? <LoadingComponent color={color} /> : null}
        </div>
    );
}
