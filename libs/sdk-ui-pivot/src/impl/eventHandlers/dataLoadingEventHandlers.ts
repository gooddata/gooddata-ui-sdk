// (C) 2007-2025 GoodData Corporation
import isEqual from "lodash/isEqual.js";

import { IPreparedExecution } from "@gooddata/sdk-backend-spi";
import { DataViewFacade, GoodDataSdkError, ILoadingState, createExportErrorFunction } from "@gooddata/sdk-ui";

import { ICorePivotTableProps } from "../../publicTypes.js";
import { InternalTableState } from "../../tableState.js";

export interface IDataLoadingEventHandlerContext {
    internal: InternalTableState;
    props: ICorePivotTableProps;
    updateStickyRow: () => void;
    updateDesiredHeight: () => void;
    setState: (updater: any, callback?: () => void) => void;
}

export class DataLoadingEventHandlers {
    constructor(private context: IDataLoadingEventHandlerContext) {}

    public onPageLoaded = (dv: DataViewFacade, newResult: boolean): void => {
        const { internal, props, updateStickyRow, updateDesiredHeight } = this.context;

        props.onDataView?.(dv);

        if (!internal.table) {
            return;
        }

        if (newResult) {
            props.onExportReady?.(internal.table.createExportFunction(props.exportTitle));
        }

        updateStickyRow();
        updateDesiredHeight();
    };

    /**
     * This will be called when user changes sorts or adds totals. This means complete re-execution with
     * new sorts or totals. Loading indicators will be shown instead of all rendered rows thanks to the
     * LoadingRenderer used in all cells of the left-most column.
     *
     * The table must take care to remove the sticky (top-pinned) row - it is treated differently by
     * ag-grid and will be literally sticking there on its own with the loading indicators.
     *
     * Once transformation finishes - indicated by call to onPageLoaded, table can re-instance the sticky row.
     *
     * @param newExecution - the new execution which is being run and will be used to populate the table
     */
    public onExecutionTransformed = (newExecution: IPreparedExecution): void => {
        const { internal, setState } = this.context;

        if (!internal.table) {
            return;
        }

        internal.table.clearStickyRow();

        // Force double execution only when totals/subtotals for columns change, so table is render properly.
        if (
            !isEqual(this.context.props.execution.definition.buckets[2], newExecution.definition.buckets[2])
        ) {
            setState({
                tempExecution: newExecution,
            });
            // Note: The original code calls reinitialize here, but we'll handle that in the main component
            // to avoid circular dependencies
            (this.context as any).reinitialize?.(newExecution);
        }
    };

    public onLoadingChanged = (loadingState: ILoadingState): void => {
        const { props, setState } = this.context;
        const { onLoadingChanged } = props;

        if (onLoadingChanged) {
            onLoadingChanged(loadingState);
            setState({ isLoading: loadingState.isLoading });
        }
    };

    public onError = (error: GoodDataSdkError, execution = this.context.props.execution): void => {
        const { props, setState } = this.context;
        const { onExportReady } = props;

        if (props.execution.fingerprint() === execution.fingerprint()) {
            setState({ error: error.getMessage(), readyToRender: true });

            // update loading state when an error occurs
            this.onLoadingChanged({ isLoading: false });

            onExportReady!(createExportErrorFunction(error));

            props.onError?.(error);
        }
    };
}
