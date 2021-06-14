// (C) 2019-2021 GoodData Corporation

import { IExecutionFactory, IExecutionResult, IPreparedExecution } from "@gooddata/sdk-backend-spi";
import invariant from "ts-invariant";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    IFilter,
    IInsight,
    insightRef,
    ISortItem,
    IExecutionConfig,
    defWithDateFormat,
    defWithExecConfig,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { convertExecutionApiError } from "../../../utils/errorHandling";
import { BearExecutionResult } from "./executionResult";
import { convertResultSpec } from "../../../convertors/toBackend/afm/ExecutionConverter";
import { SDK } from "@gooddata/api-client-bear";
import { objRefToUri } from "../../../utils/api";
import { convertFilters } from "../../../convertors/toBackend/afm/FilterConverter";

// avoid importing the type directly from some dist subdirectory of api-client-bear
type IVisualizationExecution = Parameters<SDK["execution"]["_getVisExecutionResponse"]>[1];

export class BearPreparedExecutionByRef implements IPreparedExecution {
    private _fingerprint: string | undefined;

    constructor(
        private readonly authCall: BearAuthenticatedCallGuard,
        public readonly definition: IExecutionDefinition,
        private readonly insight: IInsight,
        private readonly filters: IFilter[] = [],
        private readonly executionFactory: IExecutionFactory,
    ) {}

    public async execute(): Promise<IExecutionResult> {
        const execution = await this.createVisualizationExecution();

        return this.authCall(
            (sdk) =>
                sdk.execution
                    ._getVisExecutionResponse(this.definition.workspace, execution)
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

    private async createVisualizationExecution(): Promise<IVisualizationExecution> {
        const uri = await objRefToUri(insightRef(this.insight), this.definition.workspace, this.authCall);
        const resultSpec = convertResultSpec(this.definition);
        const filters = convertFilters(this.filters);

        return {
            visualizationExecution: {
                reference: uri,
                resultSpec,
                filters,
            },
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
