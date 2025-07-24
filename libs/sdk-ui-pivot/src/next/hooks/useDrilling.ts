// (C) 2025 GoodData Corporation
import { useCallback } from "react";
import { CellKeyDownEvent, CellClickedEvent } from "ag-grid-community";
import {
    ExplicitDrill,
    IDrillEvent,
    IDrillEventContextTable,
    OnFiredDrillEvent,
    VisualizationTypes,
    ITableDataValue,
} from "@gooddata/sdk-ui";
import { DataValue } from "@gooddata/sdk-model";
import { isEnterKey, isSpaceKey } from "@gooddata/sdk-ui-kit";
import isNil from "lodash/isNil.js";
import { AgGridRowData } from "../types/internal.js";
import { useTableMetadata } from "../context/TableMetadataContext.js";
import { isCellDrillable } from "../drill/isDrillable.js";
import { createDrillIntersection } from "../drill/intersection.js";

interface IUseDrillingProps {
    drillableItems?: ExplicitDrill[];
    onDrill?: OnFiredDrillEvent;
}

/**
 * Hook that provides drilling handlers for the new pivot table
 *
 * @alpha
 */
export function useDrilling(props: IUseDrillingProps) {
    const { drillableItems = [], onDrill } = props;
    const { currentDataView } = useTableMetadata();

    const onCellClicked = useCallback(
        (event: CellClickedEvent<AgGridRowData, string>) => {
            if (!onDrill || drillableItems.length === 0 || !currentDataView) {
                return false;
            }

            const { data, rowIndex, colDef } = event;
            if (!data || !colDef || isNil(rowIndex)) {
                return false;
            }

            const isTransposed = currentDataView.data().asTable().isTransposed;
            if (!isCellDrillable(colDef, data, drillableItems, currentDataView, isTransposed)) {
                return false;
            }

            const colId = colDef.colId!;
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            const cellMeta = data.meta?.[colId] as ITableDataValue;
            const columnIndex = cellMeta.columnIndex;
            const rowData = data.row as unknown as DataValue[];

            // Create a basic drill context
            const drillContext: IDrillEventContextTable = {
                type: VisualizationTypes.TABLE,
                element: "cell",
                columnIndex: columnIndex,
                rowIndex: rowIndex,
                row: rowData,
                intersection: createDrillIntersection(colDef, data),
            };

            // Create drill event with actual dataView from context
            const drillEvent: IDrillEvent = {
                dataView: currentDataView.dataView,
                drillContext,
            };

            if (onDrill(drillEvent)) {
                // Dispatch custom drill event for embedded scenarios
                const customEvent = new CustomEvent("drill", {
                    detail: drillEvent,
                    bubbles: true,
                });
                event.event?.target?.dispatchEvent(customEvent);
                return true;
            }

            return false;
        },
        [onDrill, drillableItems, currentDataView],
    );

    const onCellKeyDown = useCallback(
        (event: CellKeyDownEvent) => {
            if (!onDrill || drillableItems.length === 0) {
                return;
            }

            // Check if it's a keyboard event and if Enter or Space was pressed
            if (!event.event || !(event.event instanceof KeyboardEvent)) {
                return;
            }

            if (
                !isEnterKey(event.event as unknown as React.KeyboardEvent) &&
                !isSpaceKey(event.event as unknown as React.KeyboardEvent)
            ) {
                return;
            }

            // Trigger the same drill logic as cell click
            const cellEvent = event as unknown as CellClickedEvent<AgGridRowData, string>;
            onCellClicked(cellEvent);
        },
        [onCellClicked, onDrill, drillableItems],
    );

    return {
        onCellClicked,
        onCellKeyDown,
    };
}
