// (C) 2025 GoodData Corporation

import { ConfigSubsection } from "./ConfigSubsection.js";
import { CellTextWrappingControl } from "./PivotTableTextWrappingControl.js";
import { messages } from "../../../locales.js";
import { IVisualizationProperties } from "../../interfaces/Visualization.js";

export interface ICellsControlProps {
    pushData: (data: any) => any;
    properties: IVisualizationProperties;
    isDisabled: boolean;
}

/**
 * Cells configuration control for PivotTableNext.
 * Contains cell-specific settings like text wrapping.
 *
 * @internal
 */
export function CellsControl({ pushData, properties, isDisabled }: ICellsControlProps) {
    return (
        <ConfigSubsection title={messages["cellsTitle"].id}>
            <CellTextWrappingControl properties={properties} pushData={pushData} disabled={isDisabled} />
        </ConfigSubsection>
    );
}
