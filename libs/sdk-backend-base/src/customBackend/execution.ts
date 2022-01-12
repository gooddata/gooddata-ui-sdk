// (C) 2019-2022 GoodData Corporation

import { AbstractExecutionFactory } from "../toolkit/execution";
import {
    defFingerprint,
    IExecutionDefinition,
    IDimension,
    DimensionGenerator,
    ISortItem,
    defWithDimensions,
    defWithSorting,
    defWithDateFormat,
    defWithExecConfig,
    IExecutionConfig,
} from "@gooddata/sdk-model";
import {
    IDimensionDescriptor,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IPreparedExecution,
    NotSupported,
    IExportResult,
    IDataView,
    NotImplemented,
} from "@gooddata/sdk-backend-spi";
import isEqual from "lodash/isEqual";
import {
    CustomBackendConfig,
    CustomBackendState,
    DataProviderContext,
    ResultProviderContext,
} from "./config";

/**
 * @internal
 */
export class CustomExecutionFactory extends AbstractExecutionFactory {
    constructor(
        workspace: string,
        private readonly config: CustomBackendConfig,
        private readonly state: CustomBackendState,
    ) {
        super(workspace);
    }

    public forDefinition = (def: IExecutionDefinition): IPreparedExecution => {
        return new CustomPreparedExecution(def, this, this.config, this.state);
    };
}

/**
 * @internal
 */
class CustomPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
        private readonly config: CustomBackendConfig,
        private readonly state: CustomBackendState,
    ) {}

    public execute = (): Promise<IExecutionResult> => {
        const { authApiCall } = this.state;

        return authApiCall((client) => {
            const context: ResultProviderContext = {
                config: this.config,
                execution: this,
                resultFactory: this.resultFactory,
                state: this.state,
                client,
            };

            return this.config.resultProvider(context);
        });
    };

    public explain = (): Promise<void> => {
        // eslint-disable-next-line no-console
        console.warn("Backend does not support explain mode");
        return Promise.resolve();
    };

    public withDimensions = (...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution => {
        return this.executionFactory.forDefinition(defWithDimensions(this.definition, ...dimsOrGen));
    };

    public withSorting = (...items: ISortItem[]): IPreparedExecution => {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items));
    };

    public withDateFormat = (dateFormat: string): IPreparedExecution => {
        return this.executionFactory.forDefinition(defWithDateFormat(this.definition, dateFormat));
    };

    public withExecConfig = (config: IExecutionConfig): IPreparedExecution => {
        return this.executionFactory.forDefinition(defWithExecConfig(this.definition, config));
    };

    public equals = (other: IPreparedExecution): boolean => {
        return isEqual(this.definition, other.definition);
    };

    public fingerprint = (): string => {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    };

    private resultFactory = (dimensions: IDimensionDescriptor[], fingerprint: string) => {
        return new CustomExecutionResult(dimensions, fingerprint, this, this.config, this.state);
    };
}

/**
 * @internal
 */
class CustomExecutionResult implements IExecutionResult {
    public readonly definition: IExecutionDefinition;

    constructor(
        public readonly dimensions: IDimensionDescriptor[],
        private readonly _fingerprint: string,
        private readonly execution: IPreparedExecution,
        private readonly config: CustomBackendConfig,
        private readonly state: CustomBackendState,
    ) {
        this.definition = execution.definition;
    }

    public readAll = (): Promise<IDataView> => {
        return this.state.authApiCall((client) => {
            if (!this.config.dataProvider) {
                throw new NotImplemented("custom backend does not specify dataProvider");
            }

            const context: DataProviderContext = {
                config: this.config,
                state: this.state,
                result: this,
                client,
            };

            return this.config.dataProvider(context);
        });
    };

    public readWindow = (offset: number[], size: number[]): Promise<IDataView> => {
        return this.state.authApiCall((client) => {
            if (!this.config.dataProvider) {
                throw new NotImplemented("custom backend does not specify dataProvider");
            }

            const context: DataProviderContext = {
                config: this.config,
                state: this.state,
                result: this,
                window: {
                    offset,
                    size,
                },
                client,
            };

            return this.config.dataProvider(context);
        });
    };

    public transform = (): IPreparedExecution => {
        return this.execution;
    };

    public equals = (other: IExecutionResult): boolean => {
        return this._fingerprint === other.fingerprint();
    };

    public fingerprint = (): string => {
        return this._fingerprint;
    };

    public export = (_options: IExportConfig): Promise<IExportResult> => {
        throw new NotSupported("exports from custom backend are not supported");
    };
}
