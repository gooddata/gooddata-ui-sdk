// (C) 2019-2026 GoodData Corporation

import { type FilterDefinition, type ITigerClientBase } from "@gooddata/api-client-tiger";
import {
    ExecutionAPI_ChangeAnalysis,
    ExecutionResultAPI_ChangeAnalysisResult,
} from "@gooddata/api-client-tiger/endpoints/execution";
import {
    type IChangeAnalysisDefinition,
    type IChangeAnalysisOptions,
    type IChangeAnalysisPeriod,
    type IChangeAnalysisResults,
    type IWorkspaceKeyDriverAnalysisService,
} from "@gooddata/sdk-backend-spi";

import { type DateStringifier } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { convertChangeAnalyzeToKeyDriver } from "../../../convertors/fromBackend/KdaConverter.js";
import { convertAttribute } from "../../../convertors/toBackend/afm/AttributeConverter.js";
import { convertFilter } from "../../../convertors/toBackend/afm/FilterConverter.js";
import { convertMeasure } from "../../../convertors/toBackend/afm/MeasureConverter.js";
import { type TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceKeyDriverAnalysis implements IWorkspaceKeyDriverAnalysisService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateStringifier: DateStringifier,
    ) {}

    public async computeChangeAnalysis(
        definition: IChangeAnalysisDefinition,
        period: IChangeAnalysisPeriod,
        options?: IChangeAnalysisOptions,
    ): Promise<IChangeAnalysisResults> {
        return this.authCall(async (client) => {
            const filters = definition.filters?.map((f) => convertFilter(f)).filter(Boolean) as
                | FilterDefinition[]
                | undefined;

            const results = await ExecutionAPI_ChangeAnalysis(
                client.axios,
                client.basePath,
                {
                    workspaceId: this.workspace,
                    changeAnalysisRequest: {
                        //period
                        referencePeriod: this.dateStringifier(new Date(period.from), period.granularity),
                        analyzedPeriod: this.dateStringifier(new Date(period.to), period.granularity),
                        //definition
                        measure: convertMeasure(definition.measure),
                        dateAttribute: convertAttribute(period.dateAttribute, 0),
                        auxMeasures: definition.auxMeasures?.map(convertMeasure),
                        attributes: definition.attributes?.map((attr, i) => convertAttribute(attr, i + 1)),
                        //filters
                        filters: filters,
                        //settings
                        useSmartAttributeSelection: true,
                        //tags
                        includeTags: options?.includeTags,
                        excludeTags: options?.excludeTags,
                    },
                },
                {},
            );

            const link = results.data.links.executionResult;
            return await this.retrieveComputeResult(client, link);
        });
    }

    private async retrieveComputeResult(
        client: ITigerClientBase,
        resultId: string,
    ): Promise<IChangeAnalysisResults> {
        const result = await ExecutionResultAPI_ChangeAnalysisResult(client.axios, client.basePath, {
            workspaceId: this.workspace,
            resultId,
        });

        const list = result.data.data;
        const keyDrivers = list.map((item) => convertChangeAnalyzeToKeyDriver(item));

        const toValue = list[0]?.overallMetricValueInAnalyzedPeriod ?? 0;
        const fromValue = list[0]?.overallMetricValueInReferencePeriod ?? 0;

        return {
            keyDrivers,
            fromValue,
            toValue,
        };
    }
}
