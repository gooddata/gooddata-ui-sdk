// (C) 2007-2022 GoodData Corporation
import { v4 as uuid } from "uuid";
import { IDataView, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    DecoratedDataView,
    DecoratedExecutionResult,
    DecoratedPreparedExecution,
    PreparedExecutionWrapper,
} from "../decoratedBackend/execution";
import { AnalyticalBackendCallbacks } from "./types";

export class WithExecutionEventing extends DecoratedPreparedExecution {
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

                // Some charts (eg Pivot Table) access the result from the data view
                // and then run readWindow again on it, so decorate also the DataView
                // to avoid losing some of the results.
                return new WithExecutionDataViewEventing(res, this);
            })
            .catch((e) => {
                failedResultReadWindow?.(offset, size, e, this.executionId);

                throw e;
            });
    };
}

class WithExecutionDataViewEventing extends DecoratedDataView {
    constructor(decorated: IDataView, result: IExecutionResult) {
        super(decorated, result);
    }
}
