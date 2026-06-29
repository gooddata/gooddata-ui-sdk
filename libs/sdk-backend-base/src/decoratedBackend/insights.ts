// (C) 2024-2026 GoodData Corporation

import {
    type IGetInsightOptions,
    type IGetVisualizationClassesOptions,
    type IInsightReferences,
    type IInsightReferencing,
    type IInsightsQuery,
    type IInsightsQueryOptions,
    type IInsightsQueryResult,
    type IWorkspaceInsightsService,
    type SupportedInsightReferenceTypes,
} from "@gooddata/sdk-backend-spi";
import {
    type ICatalogAttribute,
    type ICatalogFact,
    type ICatalogMeasure,
    type IFilter,
    type IInsight,
    type IInsightDefinition,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type IObjectCertificationWrite,
    type IVisualizationClass,
    type ObjRef,
} from "@gooddata/sdk-model";

/**
 * Abstract base class for decorators of the {@link @gooddata/sdk-backend-spi#IWorkspaceInsightsService}.
 *
 * @remarks
 * It delegates all the calls to the decorated service. Override the methods you want to enrich.
 *
 * @alpha
 */
export abstract class DecoratedWorkspaceInsightsService implements IWorkspaceInsightsService {
    protected constructor(
        protected readonly decorated: IWorkspaceInsightsService,
        public readonly workspace: string,
    ) {}

    public getVisualizationClass(ref: ObjRef): Promise<IVisualizationClass> {
        return this.decorated.getVisualizationClass(ref);
    }

    public getVisualizationClasses(
        options?: IGetVisualizationClassesOptions,
    ): Promise<IVisualizationClass[]> {
        return this.decorated.getVisualizationClasses(options);
    }

    public getInsightWithCatalogItems(ref: ObjRef): Promise<{
        insight: IInsight;
        catalogItems: Array<ICatalogFact | ICatalogMeasure | ICatalogAttribute>;
    }> {
        return this.decorated.getInsightWithCatalogItems(ref);
    }

    public getInsight(ref: ObjRef, options?: IGetInsightOptions): Promise<IInsight> {
        return this.decorated.getInsight(ref, options);
    }

    public getInsights(options?: IInsightsQueryOptions): Promise<IInsightsQueryResult> {
        return this.decorated.getInsights(options);
    }

    public getInsightsQuery(): IInsightsQuery {
        return this.decorated.getInsightsQuery();
    }

    public createInsight(insight: IInsightDefinition): Promise<IInsight> {
        return this.decorated.createInsight(insight);
    }

    public updateInsight(insight: IInsight): Promise<IInsight> {
        return this.decorated.updateInsight(insight);
    }

    public updateInsightMeta(
        insight: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IInsight> {
        return this.decorated.updateInsightMeta(insight);
    }

    public setCertification(ref: ObjRef, certification?: IObjectCertificationWrite): Promise<void> {
        return this.decorated.setCertification(ref, certification);
    }

    public deleteInsight(ref: ObjRef): Promise<void> {
        return this.decorated.deleteInsight(ref);
    }

    public getInsightReferencedObjects(
        insight: IInsight,
        types?: SupportedInsightReferenceTypes[],
    ): Promise<IInsightReferences> {
        return this.decorated.getInsightReferencedObjects(insight, types);
    }

    public getInsightReferencingObjects(ref: ObjRef): Promise<IInsightReferencing> {
        return this.decorated.getInsightReferencingObjects(ref);
    }

    public getInsightWithAddedFilters<T extends IInsightDefinition>(
        insight: T,
        filters: IFilter[],
    ): Promise<T> {
        return this.decorated.getInsightWithAddedFilters(insight, filters);
    }
}
