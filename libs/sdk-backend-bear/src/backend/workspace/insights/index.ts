// (C) 2019-2022 GoodData Corporation
import flatMap from "lodash/flatMap.js";
import flow from "lodash/flow.js";
import map from "lodash/fp/map.js";
import sortBy from "lodash/fp/sortBy.js";
import {
    IGetVisualizationClassesOptions,
    IInsightsQueryOptions,
    IInsightsQueryResult,
    IInsightReferences,
    IInsightReferencing,
    IWorkspaceInsightsService,
    SupportedInsightReferenceTypes,
    IGetInsightOptions,
} from "@gooddata/sdk-backend-spi";
import { GdcVisualizationClass, GdcVisualizationObject, GdcMetadata } from "@gooddata/api-model-bear";
import { IGetObjectsByQueryOptions } from "@gooddata/api-client-bear";
import {
    IInsight,
    IInsightDefinition,
    insightId,
    insightVisualizationUrl,
    IVisualizationClass,
    ObjRef,
    IFilter,
    insightFilters,
    insightSetFilters,
    IUser,
} from "@gooddata/sdk-model";
import { convertVisualizationClass } from "../../../convertors/fromBackend/VisualizationClassConverter.js";
import { convertVisualization } from "../../../convertors/fromBackend/VisualizationConverter.js";
import { convertMetadataObjectXrefEntry } from "../../../convertors/fromBackend/MetaConverter.js";
import { convertInsight, convertInsightDefinition } from "../../../convertors/toBackend/InsightConverter.js";
import { objRefToUri, objRefsToUris, getObjectIdFromUri, updateUserMap } from "../../../utils/api.js";
import { BearAuthenticatedCallGuard } from "../../../types/auth.js";
import { InsightReferencesQuery } from "./insightReferences.js";
import { appendFilters } from "./filterMerging.js";
import { ServerPaging } from "@gooddata/sdk-backend-base";
import { getVisualizationUserUris } from "../../../utils/metadata.js";

export class BearWorkspaceInsights implements IWorkspaceInsightsService {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (ref: ObjRef): Promise<IVisualizationClass> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visClassResult = await this.authCall(
            (sdk) => sdk.md.getObjects(this.workspace, [uri]) as Promise<any>,
        );

        return convertVisualizationClass(visClassResult[0]);
    };

    public getVisualizationClasses = async (
        options: IGetVisualizationClassesOptions = {},
    ): Promise<IVisualizationClass[]> => {
        const visualizationClassesResult: GdcVisualizationClass.IVisualizationClassWrapped[] =
            await this.authCall((sdk) => {
                const queryOptions: IGetObjectsByQueryOptions = {
                    category: "visualizationClass",
                };

                if (options.includeDeprecated) {
                    queryOptions.deprecated = true;
                }

                return sdk.md.getObjectsByQuery(this.workspace, queryOptions);
            });

        const visClassOrderingIndex = (visClass: GdcVisualizationClass.IVisualizationClassWrapped) =>
            visClass.visualizationClass.content.orderIndex ?? 0;

        return flow(
            sortBy(visClassOrderingIndex),
            map(convertVisualizationClass),
        )(visualizationClassesResult);
    };

    public getInsight = async (ref: ObjRef, options: IGetInsightOptions = {}): Promise<IInsight> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visualization = await this.authCall((sdk) => sdk.md.getVisualization(uri));

        const userMap = options.loadUserData
            ? await updateUserMap(new Map(), getVisualizationUserUris(visualization), this.authCall)
            : undefined;

        const visClassResult: any[] = await this.authCall((sdk) =>
            sdk.md.getObjects(this.workspace, [
                visualization.visualizationObject.content.visualizationClass.uri,
            ]),
        );

        const visClass = visClassResult[0];
        const visualizationClassUri = visClass.visualizationClass.content.url;

        return convertVisualization(visualization, visualizationClassUri, userMap);
    };

    public getVisualizationClassesByVisualizationClassUri = async (
        options: IGetVisualizationClassesOptions = {},
    ): Promise<{
        [key: string]: string;
    }> => {
        const visualizationClasses = await this.getVisualizationClasses(options);
        return visualizationClasses.reduce((acc: Record<string, string>, el) => {
            if (el.visualizationClass.uri) {
                acc[el.visualizationClass.uri] = el.visualizationClass.url;
            }
            return acc;
        }, {});
    };

    public getInsights = async (options?: IInsightsQueryOptions): Promise<IInsightsQueryResult> => {
        // get also deprecated visClasses in case some insights use them
        const visualizationClassUrlByVisualizationClassUri =
            await this.getVisualizationClassesByVisualizationClassUri({ includeDeprecated: true });

        return this.getInsightsInner(options ?? {}, visualizationClassUrlByVisualizationClassUri, new Map());
    };

    private getInsightsInner = async (
        options: IInsightsQueryOptions,
        visualizationClassUrlByVisualizationClassUri: Record<string, string>,
        userMap: Map<string, IUser>,
    ): Promise<IInsightsQueryResult> => {
        const mergedOptions = { ...options, getTotalCount: true };
        const defaultLimit = 50;

        return ServerPaging.for(
            async ({ limit, offset }) => {
                const data = await this.authCall((sdk) =>
                    sdk.md.getObjectsByQueryWithPaging<GdcVisualizationObject.IVisualization>(
                        this.workspace,
                        {
                            category: "visualizationObject",
                            ...mergedOptions,
                            // the limit must be specified at all times, otherwise we get 400 (RAIL-3557)
                            limit,
                            offset,
                        },
                    ),
                );

                const {
                    items,
                    paging: { totalCount },
                } = data;

                // only load the user data if explicitly asked to do so
                const updatedUserMap = options.loadUserData
                    ? await updateUserMap(userMap, flatMap(items, getVisualizationUserUris), this.authCall)
                    : userMap;

                const insights = items.map((visualization) =>
                    convertVisualization(
                        visualization,
                        visualizationClassUrlByVisualizationClassUri[
                            visualization.visualizationObject.content.visualizationClass.uri
                        ],
                        updatedUserMap,
                    ),
                );

                return {
                    items: insights,
                    totalCount: totalCount!,
                };
            },
            mergedOptions.limit ?? defaultLimit,
            mergedOptions.offset,
        );
    };

    public createInsight = async (insight: IInsightDefinition): Promise<IInsight> => {
        const withConvertedVisClass = await this.getInsightWithConvertedVisClass(insight);

        const mdObject = await this.authCall((sdk) =>
            sdk.md.saveVisualization(this.workspace, {
                visualizationObject: convertInsightDefinition(withConvertedVisClass),
            }),
        );

        return convertVisualization(mdObject, insightVisualizationUrl(insight));
    };

    public updateInsight = async (insight: IInsight): Promise<IInsight> => {
        const id = insightId(insight);
        const uri = await this.authCall((sdk) => sdk.md.getObjectUri(this.workspace, id));

        const withConvertedVisClass = await this.getInsightWithConvertedVisClass(insight);

        await this.authCall((sdk) =>
            sdk.md.updateVisualization(this.workspace, uri, {
                visualizationObject: convertInsight(withConvertedVisClass),
            }),
        );
        // sdk.md.updateVisualization returns just an URI, so we need to return the original insight
        return insight;
    };

    public deleteInsight = async (ref: ObjRef): Promise<void> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        await this.authCall((sdk) => sdk.md.deleteVisualization(uri));
    };

    public openInsightAsReport = async (insight: IInsightDefinition): Promise<string> => {
        const visualizationObject = convertInsightDefinition(insight);
        return this.authCall((sdk) =>
            sdk.md.openVisualizationAsReport(this.workspace, { visualizationObject }),
        );
    };

    public getInsightReferencedObjects = async (
        insight: IInsight,
        types: SupportedInsightReferenceTypes[] = ["dataSet", "measure", "fact", "attribute"],
    ): Promise<IInsightReferences> => {
        return new InsightReferencesQuery(this.authCall, this.workspace, insight, types).run();
    };

    public getInsightReferencingObjects = async (ref: ObjRef): Promise<IInsightReferencing> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const objectId = getObjectIdFromUri(uri);
        return this.authCall(async (sdk) => {
            const usedBy = await sdk.xhr.getParsed<{ entries: GdcMetadata.IObjectXrefEntry[] }>(
                `/gdc/md/${this.workspace}/usedby2/${objectId}?types=analyticalDashboard`,
            );

            return {
                analyticalDashboards: usedBy.entries.map((entry: GdcMetadata.IObjectXrefEntry) =>
                    convertMetadataObjectXrefEntry("analyticalDashboard", entry),
                ),
            };
        });
    };

    public getInsightWithAddedFilters = async <T extends IInsightDefinition>(
        insight: T,
        filters: IFilter[],
    ): Promise<T> => {
        if (!filters.length) {
            return insight;
        }

        const mergedFilters = await appendFilters(insightFilters(insight), filters, (refs) =>
            objRefsToUris(refs, this.workspace, this.authCall),
        );

        return insightSetFilters(insight, mergedFilters);
    };

    private getVisualizationClassByUrl = async (url: string): Promise<IVisualizationClass | undefined> => {
        const allVisClasses = await this.getVisualizationClasses();
        return allVisClasses.find((visClass) => visClass.visualizationClass.url === url);
    };

    private async getInsightWithConvertedVisClass<T extends IInsight | IInsightDefinition>(
        insight: T,
    ): Promise<T> {
        const visClassUrl = insightVisualizationUrl(insight);
        const visClass = await this.getVisualizationClassByUrl(visClassUrl);
        if (!visClass) {
            throw new Error(`Visualization class with url ${visClassUrl} not found.`);
        }

        return {
            insight: {
                ...insight.insight,
                visualizationUrl: visClass.visualizationClass.uri, // bear client expects this to be the URI, not URL
            },
        } as T;
    }
}
