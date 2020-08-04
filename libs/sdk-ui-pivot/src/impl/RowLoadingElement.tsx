// (C) 2019 GoodData Corporation
import { ICellRendererParams } from "@ag-grid-community/all-modules";
import React from "react";
import { LoadingComponent } from "@gooddata/sdk-ui";

/**
 * This component is passed to AG-Grid and will be used to render loading indicator on row-level
 *
 * @param props
 * @constructor
 */
export const RowLoadingElement = (props: ICellRendererParams): JSX.Element => {
    if (props.node.rowPinned === "top") {
        return <span className={"gd-sticky-header-value"}>{props.formatValue(props.value)}</span>;
    }

    // rows that are still loading do not have node.id
    // pinned rows (totals) do not have node.id as well, but we want to render them using the default renderer anyway
    if (props.node.id !== undefined || props.node.rowPinned === "bottom") {
        // props.value is always unformatted
        // there is props.formattedValue, but this is null for row attributes for some reason
        return <span className={"s-value s-loading-done"}>{props.formatValue(props.value)}</span>;
    }
    return <LoadingComponent width={36} imageHeight={8} height={26} speed={2} />;
};
