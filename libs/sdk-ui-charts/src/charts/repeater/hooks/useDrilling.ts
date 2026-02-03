// (C) 2022-2026 GoodData Corporation

import { type KeyboardEvent, type MutableRefObject, useCallback, useEffect, useRef } from "react";

import {
    type CellClickedEvent,
    type CellKeyDownEvent,
    type ColDef,
    type GridReadyEvent,
} from "ag-grid-community";
import cx from "classnames";

import { type IAttributeOrMeasure, isAttributeDescriptor } from "@gooddata/sdk-model";
import {
    type DataViewFacade,
    type IDrillEvent,
    type IDrillEventContext,
    type IDrillEventIntersectionElement,
    type IHeaderPredicate,
    VisualizationTypes,
    convertDrillableItemsToPredicates,
    getChartClickCoordinates,
    isSomeHeaderPredicateMatched,
} from "@gooddata/sdk-ui";
import { isActionKey } from "@gooddata/sdk-ui-kit";

import { type DrillingState } from "../internal/privateTypes.js";
import { type IRepeaterChartProps } from "../publicTypes.js";

export function useDrilling(columnDefs: ColDef[], items: IAttributeOrMeasure[], props: IRepeaterChartProps) {
    const drillingState = useRef<DrillingState>({
        items,
        columnApi: null,
        drillablePredicates: [],
        onDrill: props.onDrill,
        dataView: props.dataView,
    });

    useEffect(() => {
        drillingState.current.drillablePredicates = convertDrillableItemsToPredicates(props.drillableItems);
        drillingState.current.onDrill = props.onDrill;
        drillingState.current.dataView = props.dataView;
    }, [props.dataView, props.drillableItems, props.onDrill]);

    const onCellClicked = useCallback((cellEvent: CellClickedEvent | CellKeyDownEvent) => {
        const drillableItem = getDrillable(
            drillingState.current.dataView,
            drillingState.current.drillablePredicates,
            cellEvent.colDef,
        );

        if (!drillableItem) {
            return false;
        }

        const columnIndex = cellEvent.api.getAllGridColumns().findIndex((col) => col === cellEvent.column);
        const attributeHeaderItem = cellEvent.data[cellEvent.colDef.field!];

        const intersectionElement: IDrillEventIntersectionElement = {
            header: {
                ...drillableItem,
                attributeHeaderItem,
            },
        };

        const drillEvent = createDrillEvent(
            drillingState,
            columnIndex,
            cellEvent.rowIndex!,
            attributeHeaderItem?.name,
            intersectionElement,
            cellEvent,
        );
        return fireDrillEvent(drillingState, drillEvent, cellEvent);
    }, []);

    const onCellKeyDown = useCallback(
        (cellEvent: CellKeyDownEvent) => {
            if (!isActionKey(cellEvent.event as unknown as KeyboardEvent)) {
                return false;
            }
            return onCellClicked(cellEvent);
        },
        [onCellClicked],
    );

    const onGridReady = useCallback(
        (readyEvent: GridReadyEvent) => {
            drillingState.current.columnApi = readyEvent.api;
        },
        [drillingState],
    );

    useEffect(() => {
        applyDrillableItems(columnDefs, drillingState);
    }, [columnDefs]);

    return {
        onGridReady,
        onCellClicked,
        onCellKeyDown,
    };
}

function applyDrillableItems(columnDefs: ColDef[], drillingState: MutableRefObject<DrillingState>) {
    const columnApi = drillingState.current.columnApi;

    columnDefs.forEach((colDef) => {
        const matched = getDrillable(
            drillingState.current.dataView,
            drillingState.current.drillablePredicates,
            colDef,
        );

        if (matched && !columnApi) {
            colDef.cellClass = cx(colDef.cellClass as string, "gd-repeater-cell-drillable");
        }
    });
}

function getDrillable(dataView: DataViewFacade, drillablePredicates: IHeaderPredicate[], colDef: ColDef) {
    const descriptors = [...dataView.meta().attributeDescriptors(), ...dataView.meta().measureDescriptors()];

    const found = descriptors.find((item) => {
        if (isAttributeDescriptor(item)) {
            return item.attributeHeader.localIdentifier === colDef.field;
        }
        return item.measureHeaderItem.localIdentifier === colDef.field;
    });
    return isSomeHeaderPredicateMatched(drillablePredicates, found!, dataView) ? found : null;
}

function createDrillEvent(
    drillingState: MutableRefObject<DrillingState>,
    columnIndex: number,
    rowIndex: number | undefined,
    value: string | undefined,
    el: IDrillEventIntersectionElement,
    cellEvent: CellClickedEvent | CellKeyDownEvent,
): IDrillEvent {
    const drillContext: IDrillEventContext = {
        type: VisualizationTypes.REPEATER,
        element: "cell",
        columnIndex,
        rowIndex,
        value,
        intersection: [el],
    };

    // Calculate chart coordinates for drill popover positioning
    const chartCoordinates = getChartClickCoordinates(cellEvent.event?.target, ".ag-root-wrapper");

    return {
        dataView: drillingState.current.dataView.dataView,
        drillContext,
        ...chartCoordinates,
    };
}

function fireDrillEvent(
    drillingState: MutableRefObject<DrillingState>,
    drillEvent: IDrillEvent,
    cellEvent: CellClickedEvent | CellKeyDownEvent,
) {
    if (drillingState.current.onDrill?.(drillEvent)) {
        // This is needed for /analyze/embedded/ drilling with post message
        // More info: https://github.com/gooddata/gdc-analytical-designer/blob/develop/test/drillEventing/drillEventing_page.html
        const event = new CustomEvent("drill", {
            detail: drillEvent,
            bubbles: true,
        });
        cellEvent.event?.target?.dispatchEvent(event);
        return true;
    }

    return false;
}
