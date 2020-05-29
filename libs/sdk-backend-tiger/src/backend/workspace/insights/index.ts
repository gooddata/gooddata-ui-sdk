// (C) 2019-2020 GoodData Corporation
import {
    IInsightQueryOptions,
    IInsightQueryResult,
    IInsightReferences,
    IWorkspaceInsights,
    SupportedInsightReferenceTypes,
    UnexpectedError,
} from "@gooddata/sdk-backend-spi";
import {
    IInsight,
    IInsightDefinition,
    IVisualizationClass,
    ObjRef,
    objRefToString,
} from "@gooddata/sdk-model";
import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToUri } from "../../../fromObjRef";

import { appendIdAndUri, insights as insightsMocks } from "./mocks/insights";
import { visualizationClasses as visualizationClassesMocks } from "./mocks/visualizationClasses";

export class TigerWorkspaceInsights implements IWorkspaceInsights {
    constructor(private readonly authCall: TigerAuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (ref: ObjRef): Promise<IVisualizationClass> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visualizationClasses = await this.getVisualizationClasses();

        const visualizationClass = visualizationClasses.find(v => v.visualizationClass.uri === uri);
        if (!visualizationClass) {
            throw new UnexpectedError(`Visualization class for ${objRefToString(ref)} not found!`);
        }
        return visualizationClass;
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        return this.authCall(async () => visualizationClassesMocks);
    };

    public getInsights = async (options?: IInsightQueryOptions): Promise<IInsightQueryResult> => {
        const insights = this.authCall(async () => {
            const emptyResult: IInsightQueryResult = {
                items: [],
                limit: options?.limit!,
                offset: options?.offset!,
                totalCount: insightsMocks.length,
                next: () => Promise.resolve(emptyResult),
            };

            const result: IInsightQueryResult = {
                items: insightsMocks,
                limit: options?.limit!,
                offset: options?.offset!,
                // split by offset
                totalCount: insightsMocks.length,
                next: () => Promise.resolve(emptyResult),
            };

            return result;
        });

        return insights;
    };

    public getInsight = async (ref: ObjRef): Promise<IInsight> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const insights = await this.getInsights();

        const insight = insights.items.find(i => i.insight.uri === uri);
        if (!insight) {
            throw new UnexpectedError(`Insight for ${objRefToString(ref)} not found!`);
        }
        return insight;
    };

    public createInsight = async (insight: IInsightDefinition): Promise<IInsight> => {
        return this.authCall(async () => appendIdAndUri(insight, "dummyId"));
    };

    public updateInsight = async (insight: IInsight): Promise<IInsight> => {
        return this.authCall(async () => insight);
    };

    public deleteInsight = async (_ref: ObjRef): Promise<void> => {
        return Promise.resolve();
    };

    public getReferencedObjects = async (
        _insight: IInsight,
        _types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences> => {
        return Promise.resolve({});
    };
}
