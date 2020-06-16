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
    insightTitle,
    insightId,
} from "@gooddata/sdk-model";
import { VisualizationObject } from "@gooddata/gd-tiger-client";
import uuid4 from "uuid/v4";

import { TigerAuthenticatedCallGuard } from "../../../types";
import { objRefToUri, objRefToIdentifier } from "../../../fromObjRef";
import { convertVisualizationObject } from "../../../toSdkModel/VisualizationObjectConverter";
import { convertInsight } from "../../../fromSdkModel/InsightConverter";

import { visualizationClasses as visualizationClassesMocks } from "./mocks/visualizationClasses";

const insightFromInsightDefinition = (insight: IInsightDefinition, id: string, uri: string): IInsight => {
    return {
        insight: {
            ...insight.insight,
            identifier: id,
            uri,
        },
    };
};

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
        const {
            data: { data: visualizationObjects, links, meta },
        } = await this.authCall(sdk => {
            const orderBy = options?.orderBy;
            if (orderBy === "updated") {
                // tslint:disable-next-line: no-console
                console.warn('Tiger does not support sorting by "updated" in getInsights');
            }

            const sanitizedOrderBy = orderBy !== "updated" ? orderBy : undefined;

            const filter = options?.title
                ? {
                      filter: {
                          // the % sign means 0..many characters so %foo% means infix match of foo (case insensitive)
                          title: { LIKE: `%${options.title}%` },
                      },
                  }
                : undefined;

            return sdk.metadata.visualizationObjectsGet({
                contentType: "application/json",
                ...(options?.limit ? { pageLimit: options?.limit } : {}),
                pageOffset: options?.offset ?? 0,
                ...((filter ? { filter } : {}) as any),
                ...(sanitizedOrderBy ? { sort: sanitizedOrderBy } : {}),
            });
        });

        const insights = visualizationObjects.map(value => {
            return insightFromInsightDefinition(
                convertVisualizationObject(
                    value.attributes.content! as VisualizationObject.IVisualizationObject,
                ),
                value.id,
                (value.links as any)?.self,
            );
        });

        const totalCount = (meta?.totalResourceCount as unknown) as number;
        const hasNextPage = !!links?.next;

        const emptyResult: IInsightQueryResult = {
            items: [],
            limit: options?.limit!,
            offset: options?.offset!,
            totalCount,
            next: () => Promise.resolve(emptyResult),
        };

        const result: IInsightQueryResult = {
            items: insights,
            limit: options?.limit!,
            offset: options?.offset!,
            totalCount,
            next: hasNextPage
                ? () => this.getInsights({ ...options, offset: (options?.offset ?? 0) + insights.length })
                : () => Promise.resolve(emptyResult),
        };

        return result;
    };

    public getInsight = async (ref: ObjRef): Promise<IInsight> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        const response = await this.authCall(sdk =>
            sdk.metadata.visualizationObjectsIdGet({
                contentType: "application/json",
                id,
            }),
        );

        const insight = insightFromInsightDefinition(
            convertVisualizationObject(
                response.data.data.attributes.content! as VisualizationObject.IVisualizationObject,
            ),
            response.data.data.id,
            (response.data.data.links as any)?.self,
        );

        if (!insight) {
            throw new UnexpectedError(`Insight for ${objRefToString(ref)} not found!`);
        }

        return insight;
    };

    public createInsight = async (insight: IInsightDefinition): Promise<IInsight> => {
        const createResponse = await this.authCall(sdk => {
            return sdk.metadata.visualizationObjectsPost({
                contentType: "application/json",
                visualizationObjectPostResource: {
                    data: {
                        id: uuid4(),
                        type: "visualizationObject", // should be VisualizationObjectPostResourceTypeEnum.VisualizationObject,
                        attributes: {
                            content: convertInsight(insight),
                            title: insightTitle(insight),
                        },
                    },
                } as any, // The OpenAPI is wrong for now, waiting for a fix on backend 3rd party dependency fix release
            });
        });

        return insightFromInsightDefinition(
            insight,
            createResponse.data.data.id,
            (createResponse.data.data.links as any)?.self,
        );
    };

    public updateInsight = async (insight: IInsight): Promise<IInsight> => {
        await this.authCall(sdk =>
            sdk.metadata.visualizationObjectsIdPatch({
                contentType: "application/json",
                id: insightId(insight),
                visualizationObjectPatchResource: {
                    data: {
                        id: insightId(insight),
                        type: "visualizationObject", // should be VisualizationObjectPostResourceTypeEnum.VisualizationObject,
                        attributes: {
                            content: convertInsight(insight),
                            title: insightTitle(insight),
                        },
                    },
                } as any, // The OpenAPI is wrong for now, waiting for a fix on backend 3rd party dependency fix release
            }),
        );

        return insight;
    };

    public deleteInsight = async (ref: ObjRef): Promise<void> => {
        const id = await objRefToIdentifier(ref, this.authCall);

        await this.authCall(sdk =>
            sdk.metadata.visualizationObjectsIdDelete({
                contentType: "application/json",
                id,
            }),
        );
    };

    public getReferencedObjects = async (
        _insight: IInsight,
        _types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences> => {
        return Promise.resolve({});
    };
}
