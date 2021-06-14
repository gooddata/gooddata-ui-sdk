// (C) 2019-2021 GoodData Corporation

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
    defWithExecConfig,
    IExecutionConfig,
} from "@gooddata/sdk-model";
import invariant from "ts-invariant";
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
        invariant(
            !isEmpty(config.dataSamplingPercentage),
            "Backend does not support data sampling, result will be not affected",
        );
        return this.executionFactory.forDefinition(defWithExecConfig(this.definition, config));
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
