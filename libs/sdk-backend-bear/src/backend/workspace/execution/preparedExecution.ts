// (C) 2019-2023 GoodData Corporation

import {
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ExplainType,
    IExplainProvider,
    NoDataError,
} from "@gooddata/sdk-backend-spi";
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
    isPositiveAttributeFilter,
    filterIsEmpty,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import isEmpty from "lodash/isEmpty.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertExecutionApiError } from "../../../utils/errorHandling.js";
import { BearExecutionResult } from "./executionResult.js";
import { toAfmExecution } from "../../../convertors/toBackend/afm/ExecutionConverter.js";

export class BearPreparedExecution implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly executionFactory: IExecutionFactory,
    ) {}

    private checkDefIsExecutable(def: IExecutionDefinition): void {
        if (def.filters?.some((filter) => isPositiveAttributeFilter(filter) && filterIsEmpty(filter))) {
            throw new NoDataError("Server returned no data");
        }
    }

    public async execute(): Promise<IExecutionResult> {
        this.checkDefIsExecutable(this.definition);
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

    public explain<T extends ExplainType | undefined>(): IExplainProvider<T> {
        console.warn("Backend does not support explain mode");
        return {
            data: () => Promise.reject(new Error(`Backend does not support explain mode data call.`)),
            download: () => Promise.resolve(),
        };
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
