// (C) 2007-2025 GoodData Corporation
import { isEqual } from "lodash-es";

import { type IPreparedExecution } from "@gooddata/sdk-backend-spi";

import { type ICorePivotTableProps } from "../../publicTypes.js";
import { type ICorePivotTableState, type InternalTableState } from "../../tableState.js";
import { type ExecutionAbortManager } from "../execution/executionAbortManager.js";

/**
 * Configuration for ComponentUpdateAnalyzer
 */
export interface IComponentUpdateAnalyzerContext {
    props: ICorePivotTableProps;
    state: ICorePivotTableState;
    internal: InternalTableState;
    executionAbortManager: ExecutionAbortManager;
}

/**
 * Analyzes component updates and determines what actions need to be taken.
 * This class encapsulates the logic for determining when to reinitialize,
 * refresh headers, or update other aspects of the table.
 *
 * @internal
 */
export class ComponentUpdateAnalyzer {
    constructor(private context: IComponentUpdateAnalyzerContext) {}

    /**
     * Determines if the update should be skipped (e.g., during loading).
     */
    public shouldSkipUpdate(): boolean {
        return (
            !this.context.state.readyToRender &&
            this.context.state.isLoading &&
            !this.context.executionAbortManager.isEnabled()
        );
    }

    /**
     * Tests whether reinitialization of ag-grid is needed after the update.
     * Currently there are two conditions:
     *
     * - drilling has changed
     * OR
     * - column headers position has changed
     * OR
     * - prepared execution has changed AND the new prep execution definition does not match currently shown data.
     */
    public isReinitNeeded(prevProps: ICorePivotTableProps): boolean {
        const drillingIsSame = isEqual(prevProps.drillableItems, this.context.props.drillableItems);

        const columnHeadersPositionIsSame = isEqual(
            prevProps.config?.columnHeadersPosition,
            this.context.props.config?.columnHeadersPosition,
        );

        if (!drillingIsSame) {
            // eslint-disable-next-line no-console
            console.debug(
                "drilling is different",
                prevProps.drillableItems,
                this.context.props.drillableItems,
            );
            return true;
        }

        if (!columnHeadersPositionIsSame) {
            return true;
        }

        if (!this.context.internal.table) {
            // Table is not yet fully initialized. See if the initialization is in progress. If so, see if
            // the init is for same execution or not. Otherwise fall back to compare props vs props.
            if (this.context.internal.initializer) {
                const initializeForSameExec = this.context.internal.initializer.isSameExecution(
                    this.context.props.execution,
                );

                if (!initializeForSameExec) {
                    // eslint-disable-next-line no-console
                    console.debug(
                        "initializer for different execution",
                        this.context.props.execution,
                        prevProps.execution,
                    );
                }

                return !initializeForSameExec;
            } else {
                const prepExecutionSame =
                    this.context.props.execution.fingerprint() === prevProps.execution.fingerprint();

                if (!prepExecutionSame) {
                    // eslint-disable-next-line no-console
                    console.debug("have to reinit table", this.context.props.execution, prevProps.execution);
                }

                return !prepExecutionSame;
            }
        }

        return this.context.executionAbortManager.isEnabled()
            ? prevProps.execution.fingerprint() !== this.context.props.execution.fingerprint()
            : // this is triggering execution multiple times in some cases which is not good together with enabled execution cancelling
              // on the other hand, without execution cancelling, fingerprint comparison only may lead to race conditions
              !this.context.internal.table.isMatchingExecution(this.context.props.execution);
    }

    /**
     * Tests whether ag-grid's refreshHeader should be called. At the moment this is necessary when user
     * turns on/off the aggregation menus through the props. The menus happen to appear in the table column headers
     * so the refresh is essential to show/hide them.
     *
     * @param prevProps - previous table props
     */
    public shouldRefreshHeader(prevProps: ICorePivotTableProps): boolean {
        const propsRequiringAgGridRerender: Array<(props: ICorePivotTableProps) => any> = [
            (props) => props?.config?.menu,
        ];
        return propsRequiringAgGridRerender.some(
            (propGetter) => !isEqual(propGetter(this.context.props), propGetter(prevProps)),
        );
    }

    /**
     * Checks if execution abort configuration has changed.
     */
    public hasExecutionCancellingChanged(prevProps: ICorePivotTableProps): boolean {
        return (
            prevProps.config?.enableExecutionCancelling !==
            this.context.props.config?.enableExecutionCancelling
        );
    }

    /**
     * Checks if grow to fit configuration has changed from disabled to enabled.
     */
    public hasGrowToFitEnabledChanged(
        prevProps: ICorePivotTableProps,
        isGrowToFitEnabled: (props?: ICorePivotTableProps) => boolean,
    ): boolean {
        return isGrowToFitEnabled() && !isGrowToFitEnabled(prevProps);
    }

    /**
     * Checks if column widths configuration has changed.
     */
    public hasColumnWidthsChanged(
        prevProps: ICorePivotTableProps,
        getColumnWidths: (props: ICorePivotTableProps) => any,
    ): boolean {
        const prevColumnWidths = getColumnWidths(prevProps);
        const columnWidths = getColumnWidths(this.context.props);
        return !isEqual(prevColumnWidths, columnWidths);
    }

    /**
     * Checks if max height configuration has changed.
     */
    public hasMaxHeightChanged(prevProps: ICorePivotTableProps): boolean {
        return (
            !!this.context.props.config?.maxHeight &&
            !isEqual(this.context.props.config?.maxHeight, prevProps.config?.maxHeight)
        );
    }

    /**
     * Logs reinit debug information.
     */
    public logReinitDebug(prevExecution: IPreparedExecution): void {
        // eslint-disable-next-line no-console
        console.debug("triggering reinit", this.context.props.execution.definition, prevExecution.definition);
    }
}
