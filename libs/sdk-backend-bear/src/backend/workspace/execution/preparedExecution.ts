// (C) 2019-2022 GoodData Corporation

import { IExecutionFactory, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
    defWithDateFormat,
    IExecutionConfig,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertExecutionApiError } from "../../../utils/errorHandling";
import { BearExecutionResult } from "./executionResult";
import { toAfmExecution } from "../../../convertors/toBackend/afm/ExecutionConverter";

export class BearPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
    ) {}

    public async execute(): Promise<IExecutionResult> {
        const afmExecution = toAfmExecution(this.definition);

        return this.authCall(
            (sdk) =>
                sdk.execution
                    .getExecutionResponse(this.definition.workspace, afmExecution)
                    .then((response) => {
                        return new BearExecutionResult(
                            this.authCall,
                            this.definition,
                            this.executionFactory,
                            response,
                        );
                    }),
            convertExecutionApiError,
        );
    }

    public async explain(): Promise<void> {
        // eslint-disable-next-line no-console
        console.warn("Backend does not support explain mode");
        return Promise.resolve();
    }

    public withDimensions(...dimsOrGen: Array<IDimension | DimensionGenerator>): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithDimensions(this.definition, ...dimsOrGen));
    }

    public withSorting(...items: ISortItem[]): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithSorting(this.definition, items));
    }

    public withDateFormat(dateFormat: string): IPreparedExecution {
        return this.executionFactory.forDefinition(defWithDateFormat(this.definition, dateFormat));
    }

    public withExecConfig(config: IExecutionConfig): IPreparedExecution {
        if (!isEmpty(config?.dataSamplingPercentage)) {
            // eslint-disable-next-line no-console
            console.warn("Backend does not support data sampling, result will be not affected");
        }
        return this.executionFactory.forDefinition(this.definition);
    }

    public fingerprint(): string {
        if (!this._fingerprint) {
            this._fingerprint = defFingerprint(this.definition);
        }

        return this._fingerprint;
    }

    public equals(other: IPreparedExecution): boolean {
        return isEqual(this.definition, other.definition);
    }
}
