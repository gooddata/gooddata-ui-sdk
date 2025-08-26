// (C) 2007-2025 GoodData Corporation
import React from "react";

import { ITheme } from "@gooddata/sdk-model";

export interface IPivotTableLoadingProps {
    LoadingComponent?: React.ComponentType<{ color?: string }>;
    theme?: ITheme;
}

export function PivotTableLoading({ LoadingComponent, theme }: IPivotTableLoadingProps): React.ReactElement {
    const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;

    return (
        <div className="s-loading gd-table-loading">
            {LoadingComponent ? <LoadingComponent color={color} /> : null}
        </div>
    );
}
