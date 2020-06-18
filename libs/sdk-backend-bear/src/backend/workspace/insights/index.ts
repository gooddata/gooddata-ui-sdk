// (C) 2019-2020 GoodData Corporation
import flow from "lodash/flow";
import filter from "lodash/fp/filter";
import map from "lodash/fp/map";
import sortBy from "lodash/fp/sortBy";
import {
    IInsightQueryOptions,
    IInsightQueryResult,
    IInsightReferences,
    IWorkspaceInsights,
    SupportedInsightReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import { GdcVisualizationClass, GdcVisualizationObject } from "@gooddata/gd-bear-model";
import {
    IInsight,
    IInsightDefinition,
    insightId,
    insightVisualizationUrl,
    IVisualizationClass,
    ObjRef,
} from "@gooddata/sdk-model";
import { convertVisualizationClass } from "../../../convertors/fromBackend/VisualizationClassConverter";
import { convertVisualization } from "../../../convertors/fromBackend/VisualizationConverter";
import { convertInsight, convertInsightDefinition } from "../../../convertors/toBackend/InsightConverter";
import { objRefToUri } from "../../../utils/api";
import { BearAuthenticatedCallGuard } from "../../../types/auth";
import { InsightReferencesQuery } from "./insightReferences";

export class BearWorkspaceInsights implements IWorkspaceInsights {
    constructor(private readonly authCall: BearAuthenticatedCallGuard, public readonly workspace: string) {}

    public getVisualizationClass = async (ref: ObjRef): Promise<IVisualizationClass> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visClassResult = await this.authCall(
            (sdk) => sdk.md.getObjects(this.workspace, [uri]) as Promise<any>,
        );

        return convertVisualizationClass(visClassResult[0]);
    };

    public getVisualizationClasses = async (): Promise<IVisualizationClass[]> => {
        const visualizationClassesResult: GdcVisualizationClass.IVisualizationClassWrapped[] = await this.authCall(
            (sdk) =>
                sdk.md.getObjectsByQuery(this.workspace, {
                    category: "visualizationClass",
                }),
        );

        const isVisClassNotDeprecated = (visClass: GdcVisualizationClass.IVisualizationClassWrapped) =>
            visClass.visualizationClass.meta.deprecated !== "1";

        const visClassOrderingIndex = (visClass: GdcVisualizationClass.IVisualizationClassWrapped) =>
            visClass.visualizationClass.content.orderIndex ?? 0;

        return flow(
            filter(isVisClassNotDeprecated),
            sortBy(visClassOrderingIndex),
            map(convertVisualizationClass),
        )(visualizationClassesResult);
    };

    public getInsight = async (ref: ObjRef): Promise<IInsight> => {
        const uri = await objRefToUri(ref, this.workspace, this.authCall);
        const visualization = await this.authCall((sdk) => sdk.md.getVisualization(uri));

        const visClassResult: any[] = await this.authCall((sdk) =>
            sdk.md.getObjects(this.workspace, [
                visualization.visualizationObject.content.visualizationClass.uri,
            ]),
        );

        const visClass = visClassResult[0];
        const visualizationClassUri = visClass.visualizationClass.content.url;

        return convertVisualization(visualization, visualizationClassUri);
    };

    public getInsights = async (options?: IInsightQueryOptions): Promise<IInsightQueryResult> => {
        const mergedOptions = { ...options, getTotalCount: true };
        const {
            items: visualizations,
            paging: { count, offset, totalCount },
        } = await this.authCall((sdk) =>
            sdk.md.getObjectsByQueryWithPaging<GdcVisualizationObject.IVisualization>(this.workspace, {
                category: "visualizationObject",
                ...mergedOptions,
            }),
        );

        const visualizationClasses = await this.getVisualizationClasses();
        const visualizationClassUrlByVisualizationClassUri: {
            [key: string]: string;
        } = visualizationClasses.reduce((acc, el) => {
            if (!el.visualizationClass.uri) {
                return acc;
            }
            return {
                ...acc,
                [el.visualizationClass.uri]: el.visualizationClass.url,
            };
        }, {});

        const insights = visualizations.map((visualization) =>
            convertVisualization(
                visualization,
                visualizationClassUrlByVisualizationClassUri[
                    visualization.visualizationObject.content.visualizationClass.uri
                ],
            ),
        );

        const emptyResult: IInsightQueryResult = {
            items: [],
            limit: count,
            offset: totalCount!,
            totalCount: totalCount!,
            next: () => Promise.resolve(emptyResult),
        };

        const hasNextPage = offset + count < totalCount!;

        return {
            items: insights,
            limit: count,
            offset,
            totalCount: totalCount!,
            next: hasNextPage
                ? () => this.getInsights({ ...options, offset: offset + count })
                : () => Promise.resolve(emptyResult),
        };
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

    public getReferencedObjects = async (
        insight: IInsight,
        types: SupportedInsightReferenceTypes[] = ["dataSet", "measure", "fact"],
    ): Promise<IInsightReferences> => {
        return new InsightReferencesQuery(this.authCall, this.workspace, insight, types).run();
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

        // tslint:disable-next-line: no-object-literal-type-assertion
        const withFixedVisClass = {
            insight: {
                ...insight.insight,
                visualizationUrl: visClass.visualizationClass.uri, // bear client expects this to be the URI, not URL
            },
        } as T;

        return withFixedVisClass;
    }
}
