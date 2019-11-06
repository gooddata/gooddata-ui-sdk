// (C) 2007-2019 GoodData Corporation
import {
    IAnalyticalBackend,
    IDataView,
    IExecutionResult,
    IPreparedExecution,
} from "@gooddata/sdk-backend-spi";
import { IExecutionDefinition } from "@gooddata/sdk-model";
import {
    decoratedBackend,
    DecoratedExecutionFactory,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
} from "../decoratedBackend";
import isEmpty = require("lodash/isEmpty");

class WithExecutionEventing extends DecoratedPreparedExecution {
    constructor(decorated: IPreparedExecution, private readonly callbacks: AnalyticalBackendCallbacks) {
        super(decorated);
    }

    public execute = (): Promise<IExecutionResult> => {
        const { beforeExecute, successfulExecute } = this.callbacks;

        if (beforeExecute) {
            beforeExecute(this.definition);
        }

        return super.execute().then(result => {
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
        const { successfulResultReadAll } = this.callbacks;

        const promisedDataView = super.readAll();

        if (successfulResultReadAll) {
            return promisedDataView.then(res => {
                successfulResultReadAll(res);

                return res;
            });
        }

        return promisedDataView;
    };
}

/**
 * Defines callbacks for events that are emitted by with eventing backend decorator.
 *
 * @internal
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
};

/**
 * This implementation of analytical backend decorates another implementation with support for eventing. Events
 * for significant actions are emitted to defined callback functions (event handlers).
 *
 * @param realBackend - backend supplying the actual implementation of SPI
 * @param callbacks - callbacks to event handlers
 * @internal
 */
export function withEventing(
    realBackend: IAnalyticalBackend,
    callbacks: AnalyticalBackendCallbacks,
): IAnalyticalBackend {
    if (isEmpty(callbacks)) {
        return realBackend;
    }

    return decoratedBackend(realBackend, {
        execution: original =>
            new DecoratedExecutionFactory(
                original,
                execution => new WithExecutionEventing(execution, callbacks),
            ),
    });
}
