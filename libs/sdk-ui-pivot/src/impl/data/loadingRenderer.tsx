// (C) 2019-2022 GoodData Corporation
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import { LoadingComponent } from "@gooddata/sdk-ui";
import React from "react";
import { VALUE_CLASS } from "../base/constants.js";
import { TableFacade } from "../tableFacade.js";
import { ICorePivotTableProps } from "../../publicTypes.js";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

/**
 * Creates a loading renderer functional component which the table uses for rendering cells that will also show loading
 * indicators as data for them is being loaded.
 *
 * NOTE: keep in mind that this loading renderer IS NOT used to configure ag-grids built-in loading renderer. This
 * renderer is essentially a custom cell renderer which our table impl uses for all cells of the left-most table column.
 */
export function createLoadingRenderer(
    _table: TableFacade,
    _props: Readonly<ICorePivotTableProps>,
): (params: ICellRendererParams) => JSX.Element {
    return function LoadingRenderer(params: ICellRendererParams): JSX.Element {
        const theme = useTheme();
        const color = theme?.table?.loadingIconColor ?? theme?.palette?.complementary?.c6 ?? undefined;

        if (params.node.rowPinned === "top") {
            return <span className={"gd-sticky-header-value"}>{params.formatValue!(params.value)}</span>;
        }

        // rows that are still loading do not have node.id
        // pinned rows (totals) do not have node.id as well, but we want to render them using the default renderer anyway
        if (params.node.id !== undefined || params.node.rowPinned === "bottom") {
            // params.value is always unformatted
            // there is params.formattedValue, but this is null for row attributes for some reason
            return (
                <span className={`${VALUE_CLASS} s-loading-done`}>{params.formatValue!(params.value)}</span>
            );
        }

        return <LoadingComponent color={color} width={36} imageHeight={8} height={26} speed={2} />;
    };
}
