// (C) 2007-2020 GoodData Corporation
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import { decoratedBackend } from "../decoratedBackend";
import isEmpty = require("lodash/isEmpty");
import {
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
} from "../decoratedBackend/execution";

class WithExecutionEventing extends DecoratedPreparedExecution {
    constructor(decorated: IPreparedExecution, private readonly callbacks: AnalyticalBackendCallbacks) {
        super(decorated);
    }

    public execute = (): Promise<IExecutionResult> => {
        const { beforeExecute, successfulExecute } = this.callbacks;

        if (beforeExecute) {
            beforeExecute(this.definition);
        }

        return super.execute().then((result) => {
            if (successfulExecute) {
                successfulExecute(result);
            }

            return new WithExecutionResultEventing(result, this.createNew, this.callbacks);
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
    ) {
        super(decorated, wrapper);
    }

    public readAll = (): Promise<IDataView> => {
        const { successfulResultReadAll, failedResultReadAll } = this.callbacks;

        const promisedDataView = super.readAll();

        return promisedDataView
            .then((res) => {
                if (successfulResultReadAll) {
                    successfulResultReadAll(res);
                }

                return res;
            })
            .catch((e) => {
                if (failedResultReadAll) {
                    failedResultReadAll(e);
                }

                throw e;
            });
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        const { successfulResultReadWindow, failedResultReadWindow } = this.callbacks;

        const promisedDataView = super.readWindow(offset, size);

        return promisedDataView
            .then((res) => {
                if (successfulResultReadWindow) {
                    successfulResultReadWindow(offset, size, res);
                }

                return res;
            })
            .catch((e) => {
                if (failedResultReadWindow) {
                    failedResultReadWindow(offset, size, e);
                }

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
     */
    beforeExecute?: (def: IExecutionDefinition) => void;

    /**
     * Called when the execute successfully completes.
     *
     * @param result - execution result (mind that this contains definition already)
     */
    successfulExecute?: (result: IExecutionResult) => void;

    /**
     * Called when IExecuteResult.readAll() successfully completes.
     *
     * @param dataView - data view (mind that this contains definition and result already)
     */
    successfulResultReadAll?: (dataView: IDataView) => void;

    /**
     * Called when IExecuteResult.readAll() ends with an error.
     *
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     */
    failedResultReadAll?: (error: any) => void;

    /**
     * Called when IExecuteResult.readWindow() successfully completes. The function is called with the requested
     * window arguments and the resulting data size (note: requested window & actual window may differ)
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param dataView - data view (mind that this contains definition and result already)
     */
    successfulResultReadWindow?: (offset: number[], size: number[], dataView: IDataView) => void;

    /**
     * Called when IExecuteResult.readWindow() ends with an error. The function is called with the requested
     * window arguments and the error from the underlying backend.
     *
     * @param offset - *requested window offset, the actual offset may differ, actual offset is in data view
     * @param size - *request* window size, the actual size may differ, actual size is in data view
     * @param error - error from the underlying backend, contractually this should be an instance of AnalyticalBackendError
     */
    failedResultReadWindow?: (offset: number[], size: number[], error: any) => void;
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
