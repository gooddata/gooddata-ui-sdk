// (C) 2019-2025 GoodData Corporation

import { AfmObjectIdentifier, ITigerClient } from "@gooddata/api-client-tiger";
import {
    type IChangeAnalysisPeriod,
    type IChangeAnalysisResults,
    type IWorkspaceKdaService,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";

import { DateStringifier } from "../../../convertors/fromBackend/dateFormatting/types.js";
import { convertChangeAnalyzeToKeyDriver } from "../../../convertors/fromBackend/KdaConverter.js";
import { toAfmIdentifier } from "../../../convertors/toBackend/ObjRefConverter.js";
import { TigerAuthenticatedCallGuard } from "../../../types/index.js";

export class TigerWorkspaceKda implements IWorkspaceKdaService {
    constructor(
        private readonly authCall: TigerAuthenticatedCallGuard,
        public readonly workspace: string,
        private readonly dateStringifier: DateStringifier,
    ) {}

    public async computeChangeAnalysis(
        period: IChangeAnalysisPeriod,
        metric: ObjRef,
        attributes: ObjRef[],
    ): Promise<IChangeAnalysisResults> {
        return this.authCall(async (client) => {
            const results = await client.execution.changeAnalysis(
                {
                    workspaceId: this.workspace,
                    changeAnalysisRequest: {
                        //period
                        referencePeriod: this.dateStringifier(new Date(period.from), period.granularity),
                        analyzedPeriod: this.dateStringifier(new Date(period.to), period.granularity),
                        dateAttributeIdentifier: objRefToId(period.dateAttribute),
                        //key drivers
                        attributeLabelIdentifiers: attributes.map(objRefToId),
                        metricIdentifier: objRefToId(metric),
                        //filters
                        filters: [],
                    },
                },
                {},
            );

            const link = results.data.links.executionResult;
            return await this.retrieveComputeResult(client, link);
        });
    }

    private async retrieveComputeResult(
        client: ITigerClient,
        resultId: string,
    ): Promise<IChangeAnalysisResults> {
        const result = await client.executionResult.changeAnalysisResult({
            workspaceId: this.workspace,
            resultId,
        });

        const list = result.data.data;
        const keyDrivers = list.map((item) => convertChangeAnalyzeToKeyDriver(item));

        return {
            keyDrivers,
        };
    }
}

function objRefToId(ref: ObjRef) {
    const identifier = toAfmIdentifier(ref) as AfmObjectIdentifier;
    return identifier.identifier.id;
}
