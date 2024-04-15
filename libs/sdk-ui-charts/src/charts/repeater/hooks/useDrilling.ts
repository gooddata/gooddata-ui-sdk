// (C) 2022-2024 GoodData Corporation

import { useCallback, useEffect, useRef, MutableRefObject } from "react";
import { ColDef, CellClickedEvent, GridReadyEvent } from "@ag-grid-community/all-modules";
import {
    convertDrillableItemsToPredicates,
    isSomeHeaderPredicateMatched,
    DataViewFacade,
    IHeaderPredicate,
    VisualizationTypes,
    IDrillEventIntersectionElement,
    IDrillEvent,
    IDrillEventContext,
} from "@gooddata/sdk-ui";
import { IAttributeOrMeasure, isAttributeDescriptor } from "@gooddata/sdk-model";

import { IRepeaterChartProps } from "../publicTypes.js";
import { DrillingState } from "../internal/privateTypes.js";
import cx from "classnames";

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

    const onCellClicked = useCallback((cellEvent: CellClickedEvent) => {
        const drillableItem = getDrillable(
            drillingState.current.dataView,
            drillingState.current.drillablePredicates,
            cellEvent.colDef,
        );

        if (!drillableItem) {
            return false;
        }

        const columnIndex = cellEvent.columnApi.getAllColumns().findIndex((col) => col === cellEvent.column);
        const attributeHeaderItem = cellEvent.data[cellEvent.colDef.field];

        const intersectionElement: IDrillEventIntersectionElement = {
            header: {
                ...drillableItem,
                attributeHeaderItem,
            },
        };

        const drillEvent = createDrillEvent(
            drillingState,
            columnIndex,
            cellEvent.rowIndex,
            attributeHeaderItem?.name,
            intersectionElement,
        );
        return fireDrillEvent(drillingState, drillEvent, cellEvent);
    }, []);

    const onGridReady = useCallback(
        (readyEvent: GridReadyEvent) => {
            drillingState.current.columnApi = readyEvent.columnApi;
        },
        [drillingState],
    );

    useEffect(() => {
        applyDrillableItems(columnDefs, drillingState);
    }, [columnDefs]);

    return {
        onGridReady,
        onCellClicked,
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
    return isSomeHeaderPredicateMatched(drillablePredicates, found, dataView) ? found : null;
}

function createDrillEvent(
    drillingState: MutableRefObject<DrillingState>,
    columnIndex: number,
    rowIndex: number,
    value: string | undefined,
    el: IDrillEventIntersectionElement,
): IDrillEvent {
    const drillContext: IDrillEventContext = {
        type: VisualizationTypes.REPEATER,
        element: "cell",
        columnIndex,
        rowIndex,
        value,
        intersection: [el],
    };
    return {
        dataView: drillingState.current.dataView.dataView,
        drillContext,
    };
}

function fireDrillEvent(
    drillingState: MutableRefObject<DrillingState>,
    drillEvent: IDrillEvent,
    cellEvent: CellClickedEvent,
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
