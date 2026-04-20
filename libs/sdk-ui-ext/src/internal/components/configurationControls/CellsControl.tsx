// (C) 2025-2026 GoodData Corporation

import { messages } from "../../../locales.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";
import { ConfigSubsection } from "./ConfigSubsection.js";
import { CellTextWrappingControl } from "./PivotTableTextWrappingControl.js";

export interface ICellsControlProps {
    pushData?: (data: any) => any;
    properties?: IVisualizationProperties;
    isDisabled?: boolean;
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
            <CellTextWrappingControl properties={properties!} pushData={pushData!} disabled={isDisabled} />
        </ConfigSubsection>
    );
}
