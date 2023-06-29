// (C) 2007-2021 GoodData Corporation
import isEmpty from "lodash/isEmpty.js";
import { v4 as uuid } from "uuid";
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";

import { decoratedBackend } from "../decoratedBackend/index.js";
import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
} from "../decoratedBackend/execution.js";

class WithExecutionEventing extends DecoratedPreparedExecution {
    constructor(decorated: IPreparedExecution, private readonly callbacks: AnalyticalBackendCallbacks) {
        super(decorated);
    }

    public execute = (): Promise<IExecutionResult> => {
        const { beforeExecute, successfulExecute, failedExecute } = this.callbacks;
        const executionId = uuid();

        beforeExecute?.(this.definition, executionId);

        return super
            .execute()
            .then((result) => {
                successfulExecute?.(result, executionId);

                return new WithExecutionResultEventing(result, this.createNew, this.callbacks, executionId);
            })
            .catch((error) => {
                failedExecute?.(error, executionId);

                throw error;
            });
    };

    protected createNew = (decorated: IPreparedExecution): IPreparedExecution => {
        return new WithExecutionEventing(decorated, this.callbacks);
    };
}

class WithExecutionResultEventing extends DecoratedExecutionResult {
    constructor(
        decorated: IExecutionResult,
        wrapper: PreparedExecutionWrapper,
        private readonly callbacks: AnalyticalBackendCallbacks,
        private readonly executionId: string,
    ) {
        super(decorated, wrapper);
    }

    public readAll = (): Promise<IDataView> => {
        const { successfulResultReadAll, failedResultReadAll } = this.callbacks;

        const promisedDataView = super.readAll();

        return promisedDataView
            .then((res) => {
                successfulResultReadAll?.(res, this.executionId);

                return res;
            })
            .catch((e) => {
                failedResultReadAll?.(e, this.executionId);

                throw e;
            });
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        const { successfulResultReadWindow, failedResultReadWindow } = this.callbacks;

        const promisedDataView = super.readWindow(offset, size);

        return promisedDataView
            .then((res) => {
                successfulResultReadWindow?.(offset, size, res, this.executionId);

                return res;
            })
            .catch((e) => {
                failedResultReadWindow?.(offset, size, e, this.executionId);

                throw e;
            });
    };
}

/**
 * Defines callbacks for events that are emitted by with eventing backend decorator.
 *
 * @beta
 */
export type AnalyticalBackendCallbacks = {
    /**
     * Called before prepared execution's execute() is called.
     *
     * @param def - definition that will be used for the execution
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    beforeExecute?: (def: IExecutionDefinition, executionId: string) => void;

    /**
     * Called when the execute successfully completes.
     *
     * @param result - execution result (mind that this contains definition already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulExecute?: (result: IExecutionResult, executionId: string) => void;

    /**
     * Called when the execute ends with an error.
     *
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedExecute?: (error: any, executionId: string) => void;

    /**
     * Called when IExecuteResult.readAll() successfully completes.
     *
     * @param dataView - data view (mind that this contains definition and result already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulResultReadAll?: (dataView: IDataView, executionId: string) => void;

    /**
     * Called when IExecuteResult.readAll() ends with an error.
     *
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedResultReadAll?: (error: any, executionId: string) => void;

    /**
     * Called when IExecuteResult.readWindow() successfully completes. The function is called with the requested
     * window arguments and the resulting data size (note: requested window & actual window may differ)
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param dataView - data view (mind that this contains definition and result already)
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    successfulResultReadWindow?: (
        offset: number[],
        size: number[],
        dataView: IDataView,
        executionId: string,
    ) => void;

    /**
     * Called when IExecuteResult.readWindow() ends with an error. The function is called with the requested
     * window arguments and the error from the underlying backend.
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     * @param executionId - unique ID assigned to each execution that can be used to correlate individual events that "belong" to the same execution
     */
    failedResultReadWindow?: (offset: number[], size: number[], error: any, executionId: string) => void;
};

/**
 * This implementation of analytical backend decorates another implementation with support for eventing. Events
 * for significant actions are emitted to defined callback functions (event handlers).
 *
 * @param realBackend - backend supplying the actual implementation of SPI
 * @param callbacks - callbacks to event handlers
 * @beta
 */
export function withEventing(
    realBackend: IAnalyticalBackend,
    callbacks: AnalyticalBackendCallbacks,
): IAnalyticalBackend {
    if (isEmpty(callbacks)) {
        return realBackend;
    }

    return decoratedBackend(realBackend, {
        execution: (original) =>
            new DecoratedExecutionFactory(
                original,
                (execution) => new WithExecutionEventing(execution, callbacks),
            ),
    });
}
