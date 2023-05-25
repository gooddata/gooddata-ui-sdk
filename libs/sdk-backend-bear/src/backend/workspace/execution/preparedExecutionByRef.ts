// (C) 2019-2022 GoodData Corporation

import {
    IExecutionFactory,
    IExecutionResult,
    IPreparedExecution,
    ExplainType,
    IExplainProvider,
} from "@gooddata/sdk-backend-spi";
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
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import isEmpty from "lodash/isEmpty.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { convertExecutionApiError } from "../../../utils/errorHandling.js";
import { BearExecutionResult } from "./executionResult.js";
import { convertResultSpec } from "../../../convertors/toBackend/afm/ExecutionConverter.js";
import { SDK } from "@gooddata/api-client-bear";
import { objRefToUri } from "../../../utils/api.js";
import { convertFilters } from "../../../convertors/toBackend/afm/FilterConverter.js";

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

    public explain<T extends ExplainType | undefined>(): IExplainProvider<T> {
        console.warn("Backend does not support explain mode");
        return {
            data: () => Promise.reject(new Error(`Backend does not support explain mode data call.`)),
            download: () => Promise.resolve(),
        };
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
