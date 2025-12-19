// (C) 2019-2025 GoodData Corporation

import { isEmpty, isEqual } from "lodash-es";

import {
    type AutomationFilterType,
    type AutomationType,
    type ExplainType,
    type FilterWithResolvableElements,
    type FiltersByTab,
    type IAnalyticalBackend,
    type IAnalyticalBackendConfig,
    type IAnalyticalWorkspace,
    type IAnomalyDetectionResult,
    type IAttributeHierarchiesService,
    type IAttributeWithReferences,
    type IAttributesQuery,
    type IAttributesQueryResult,
    type IAuthenticatedPrincipal,
    type IAuthenticationProvider,
    type IAutomationsQuery,
    type IAutomationsQueryResult,
    type IChatThread,
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDashboardExportImageOptions,
    type IDashboardExportPdfOptions,
    type IDashboardExportPresentationOptions,
    type IDashboardExportRawOptions,
    type IDashboardExportTabularOptions,
    type IDashboardReferences,
    type IDashboardWithReferences,
    type IDashboardsQuery,
    type IDashboardsQueryResult,
    type IDataFiltersService,
    type IDataSourcesService,
    type IDataView,
    type IDatasetsQuery,
    type IDatasetsQueryResult,
    type IDateFilterConfigsQuery,
    type IElementsQuery,
    type IElementsQueryAttributeFilter,
    type IElementsQueryFactory,
    type IElementsQueryOptions,
    type IElementsQueryResult,
    type IEntitlements,
    type IExecutionContext,
    type IExecutionFactory,
    type IExecutionResult,
    type IExplainProvider,
    type IExportConfig,
    type IExportResult,
    type IFactsQuery,
    type IFactsQueryResult,
    type IFilterElementsQuery,
    type IForecastConfig,
    type IForecastResult,
    type IForecastView,
    type IGenAIService,
    type IGeoService,
    type IGetAutomationOptions,
    type IGetAutomationsOptions,
    type IGetDashboardOptions,
    type IGetDashboardPluginOptions,
    type IGetScheduledMailOptions,
    type IInsightsQuery,
    type IInsightsQueryResult,
    type IMeasureExpressionToken,
    type IMeasureKeyDrivers,
    type IMeasureReferencing,
    type IMeasuresQuery,
    type IMeasuresQueryResult,
    type IOrganization,
    type IOrganizationAutomationService,
    type IOrganizationLlmEndpointsService,
    type IOrganizationNotificationChannelService,
    type IOrganizationNotificationService,
    type IOrganizationPermissionService,
    type IOrganizationSettingsService,
    type IOrganizationStylingService,
    type IOrganizationUserService,
    type IOrganizations,
    type IPagedResource,
    type IPreparedExecution,
    type IPreparedExecutionOptions,
    type IRawExportCustomOverrides,
    type ISecuritySettingsService,
    type ISemanticSearchQuery,
    type IUserService,
    type IUserWorkspaceSettings,
    type IWidgetAlertCount,
    type IWidgetReferences,
    type IWorkspaceAccessControlService,
    type IWorkspaceAttributesService,
    type IWorkspaceAutomationService,
    type IWorkspaceCatalog,
    type IWorkspaceCatalogAvailableItemsFactory,
    type IWorkspaceCatalogFactory,
    type IWorkspaceCatalogFactoryOptions,
    type IWorkspaceCatalogWithAvailableItems,
    type IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    type IWorkspaceDashboardsService,
    type IWorkspaceDatasetsService,
    type IWorkspaceDescriptor,
    type IWorkspaceExportDefinitionsService,
    type IWorkspaceFactsService,
    type IWorkspaceInsightsService,
    type IWorkspaceKeyDriverAnalysisService,
    type IWorkspaceLogicalModelService,
    type IWorkspaceMeasuresService,
    type IWorkspacePermissionsService,
    type IWorkspaceSettings,
    type IWorkspaceSettingsService,
    type IWorkspaceStylingService,
    type IWorkspaceUserGroupsQuery,
    type IWorkspaceUsersQuery,
    type IWorkspacesQueryFactory,
    NoDataError,
    NotSupported,
    type SupportedDashboardReferenceTypes,
    type SupportedWidgetReferenceTypes,
    type ValidationContext,
} from "@gooddata/sdk-backend-spi";
import {
    type CatalogItem,
    type CatalogItemType,
    type DashboardFiltersApplyMode,
    type DimensionGenerator,
    type FilterContextItem,
    type IAbsoluteDateFilter,
    type IActiveCalendars,
    type IAlertDefault,
    type IAttributeDisplayFormMetadataObject,
    type IAttributeElement,
    type IAttributeMetadataObject,
    type IAttributeOrMeasure,
    type IAutomationMetadataObject,
    type IAutomationMetadataObjectDefinition,
    type IBucket,
    type ICatalogAttribute,
    type ICatalogAttributeHierarchy,
    type ICatalogDateDataset,
    type ICatalogFact,
    type ICatalogGroup,
    type ICatalogMeasure,
    type IColorPaletteDefinition,
    type IColorPaletteMetadataObject,
    type IDashboard,
    type IDashboardAttributeFilterConfig,
    type IDashboardBase,
    type IDashboardDefinition,
    type IDashboardFilterView,
    type IDashboardFilterViewSaveRequest,
    type IDashboardObjectIdentity,
    type IDashboardPermissions,
    type IDashboardPlugin,
    type IDashboardPluginDefinition,
    type IDataSetMetadataObject,
    type IDataset,
    type IDateFilter,
    type IDimension,
    type IExecutionConfig,
    type IExecutionDefinition,
    type IExistingDashboard,
    type IFactMetadataObject,
    type IFilter,
    type IFilterContext,
    type IFilterContextDefinition,
    type IFiscalYear,
    type IInsight,
    type IInsightDefinition,
    type IListedDashboard,
    type ILlmEndpointBase,
    type ILlmEndpointOpenAI,
    type IMeasure,
    type IMeasureDefinitionType,
    type IMeasureMetadataObject,
    type IMeasureMetadataObjectDefinition,
    type IMetadataObject,
    type IMetadataObjectBase,
    type IMetadataObjectIdentity,
    type IMetricFormatOverrideSetting,
    type INotificationChannelMetadataObject,
    type IOrganizationDescriptor,
    type IRelativeDateFilter,
    type IScheduledMail,
    type IScheduledMailDefinition,
    type ISeparators,
    type ISortItem,
    type IThemeDefinition,
    type IThemeMetadataObject,
    type IWidget,
    type IWidgetAlert,
    type IWidgetAlertDefinition,
    type ObjRef,
    defFingerprint,
    defWithBuckets,
    defWithDateFormat,
    defWithDimensions,
    defWithSorting,
    idRef,
    isIdentifierRef,
    isUriRef,
} from "@gooddata/sdk-model";

import { DummyAnalyticsCatalogService } from "./DummyAnalyticsCatalogService.js";
import { DummyGenAIChatThread } from "./DummyGenAIChatThread.js";
import { DummySemanticQualityService } from "./DummySemanticQualityService.js";
import { DummySemanticSearchQueryBuilder } from "./DummySemanticSearch.js";
import { AbstractExecutionFactory } from "../toolkit/execution.js";

/**
 * @internal
 */
export type DummyBackendConfig = IAnalyticalBackendConfig & {
    /**
     * Influences whether readAll() / readWindow() should throw NoDataError() or return empty data view.
     *
     * The empty data view is returned by default - and can be used in tests that verify definition parts of
     * the returned data view.
     *
     * Throwing NoDataError is closer to how normal backends behave.
     *
     * If set to "without-data-view", it will throw NoDataErrors without a DataView.
     * If set to "with-data-view", it will throw NoDataErrors with a DataView.
     */
    raiseNoDataExceptions: false | "without-data-view" | "with-data-view";
};

/**
 *
 */
export const defaultDummyBackendConfig: DummyBackendConfig = {
    hostname: "test",
    raiseNoDataExceptions: "without-data-view",
};

/**
 * Returns dummy backend - this backend focuses on the execution 'branch' of the SPI. it implements
 * execution factory and prepared execution so that clients receive NoData exception when trying to obtain
 * results.
 *
 * This implementation is suitable when testing code which builds and configures an instance of IPreparedExecution or
 * testing component behavior when backend returns no results.
 *
 * @remarks see {@link dummyBackendEmptyData} for a variant of dummy backend
 * @param config - Provide configuration of the backend (host/user)
 * @internal
 */
export function dummyBackend(config: DummyBackendConfig = defaultDummyBackendConfig): IAnalyticalBackend {
    const noopBackend: IAnalyticalBackend = {
        capabilities: {
            canCalculateTotals: true,
            canCalculateSubTotals: true,
            canCalculateNativeTotals: true,
            canCalculateGrandTotals: true,
        },
        config,
        onHostname(hostname: string): IAnalyticalBackend {
            return dummyBackend({ ...config, hostname });
        },
        withTelemetry(_component: string, _props: object): IAnalyticalBackend {
            return noopBackend;
        },
        withCorrelation(_correlationMetadata: Record<string, string>): IAnalyticalBackend {
            return this;
        },
        withAuthentication(_: IAuthenticationProvider): IAnalyticalBackend {
            return this;
        },
        organization(organizationId: string): IOrganization {
            return new DummyOrganization(organizationId);
        },
        organizations(): IOrganizations {
            return {
                getCurrentOrganization() {
                    return Promise.resolve(new DummyOrganization("dummy-organization-id"));
                },
            };
        },
        currentUser(): IUserService {
            throw new NotSupported("not supported");
        },
        workspace(id: string): IAnalyticalWorkspace {
            return dummyWorkspace(id, config);
        },
        entitlements(): IEntitlements {
            throw new NotSupported("not supported");
        },
        dataSources(): IDataSourcesService {
            throw new NotSupported("not supported");
        },
        geo(): IGeoService {
            throw new NotSupported("not supported");
        },
        workspaces(): IWorkspacesQueryFactory {
            throw new NotSupported("not supported");
        },
        authenticate(): Promise<IAuthenticatedPrincipal> {
            return Promise.resolve({ userId: "dummyUser" });
        },
        deauthenticate(): Promise<void> {
            return Promise.resolve();
        },
        isAuthenticated(): Promise<IAuthenticatedPrincipal | null> {
            return Promise.resolve({ userId: "dummyUser" });
        },
    };

    return noopBackend;
}

/**
 * Convenience function to create a dummy backend configured to NOT throw exceptions when client requests
 * data view. Instead, it returns an empty data view (which does not follow the SPI contract...)
 *
 * While this behavior violates contract of the SPI, a backend configured in this way is suitable for
 * particular test scenarios - for instance in tests that exercise logic which only works with IDataView's
 * execution definition.
 *
 * @internal
 */
export function dummyBackendEmptyData(): IAnalyticalBackend {
    return dummyBackend({ hostname: "test", raiseNoDataExceptions: false });
}

/**
 * Creates a new, empty data view for the provided execution definition. The definition will be retained as-is, data
 * will be empty.
 *
 * @param definition - execution definition
 * @param result - A result to link with the data view, if not provided an execution result will be
 *  created
 * @param config - Override config that will be passed to exec result that may be created for the
 *  data view (it is needed there in order to correctly handle readAll() and read()); config will not be used
 *  if the `result` parameter is provided explicitly
 * @returns new instance of data view
 * @internal
 */
export function dummyDataView(
    definition: IExecutionDefinition,
    result?: IExecutionResult,
    config: DummyBackendConfig = defaultDummyBackendConfig,
): IDataView {
    const factory = new DummyExecutionFactory(config, definition.workspace);
    const execResult = result || dummyExecutionResult(definition, factory, config);

    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result: execResult,
        context: execResult.context,
        headerItems: [],
        data: [],
        offset: [0, 0],
        count: [0, 0],
        totalCount: [0, 0],
        metadata: {
            dataSourceMessages: [],
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IDataView): boolean {
            return fp === other.fingerprint();
        },
        forecast(): IForecastView {
            return {
                headerItems: [],
                prediction: [],
                low: [],
                high: [],
                loading: false,
            };
        },
        withForecast(_config: IForecastConfig, _result?: IForecastResult): IDataView {
            throw new NotSupported("not supported");
        },
        clustering(): IClusteringResult {
            throw new NotSupported("clustering is not supported in this dummy backend");
        },
        withClustering(_config?: IClusteringConfig, _result?: IClusteringResult): IDataView {
            throw new NotSupported("clustering is not supported in this dummy backend");
        },
        readCollectionItems(_config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
            throw new NotSupported("readCollectionItems is not supported in this dummy backend");
        },
    };
}

//
// Internals
//

function dummyWorkspace(workspace: string, config: DummyBackendConfig): IAnalyticalWorkspace {
    return {
        workspace,
        async getDescriptor(): Promise<IWorkspaceDescriptor> {
            return dummyDescriptor(this.workspace);
        },
        async updateDescriptor(): Promise<IWorkspaceDescriptor> {
            throw new NotSupported("not supported");
        },
        getParentWorkspace(): Promise<IAnalyticalWorkspace | undefined> {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new DummyExecutionFactory(config, workspace);
        },
        catalog(): IWorkspaceCatalogFactory {
            return new DummyWorkspaceCatalogFactory(workspace);
        },
        attributes(): IWorkspaceAttributesService {
            return new DummyWorkspaceAttributesService(workspace);
        },
        measures(): IWorkspaceMeasuresService {
            return new DummyWorkspaceMeasuresService(workspace);
        },
        facts(): IWorkspaceFactsService {
            return new DummyWorkspaceFactsService(workspace);
        },
        keyDriverAnalysis(): IWorkspaceKeyDriverAnalysisService {
            throw new NotSupported("not supported");
        },
        settings(): IWorkspaceSettingsService {
            return new DummyWorkspaceSettingsService(workspace);
        },
        insights(): IWorkspaceInsightsService {
            return new DummyWorkspaceInsightsService(workspace);
        },
        dashboards(): IWorkspaceDashboardsService {
            return new DummyWorkspaceDashboardsService(workspace);
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
        datasets(): IWorkspaceDatasetsService {
            return new DummyWorkspaceDatasetsService(workspace);
        },
        permissions(): IWorkspacePermissionsService {
            throw new NotSupported("not supported");
        },
        users(): IWorkspaceUsersQuery {
            throw new NotSupported("not supported");
        },
        userGroups(): IWorkspaceUserGroupsQuery {
            throw new NotSupported("not supported");
        },
        dateFilterConfigs(): IDateFilterConfigsQuery {
            throw new NotSupported("not supported");
        },
        accessControl(): IWorkspaceAccessControlService {
            throw new NotSupported("not supported");
        },
        attributeHierarchies(): IAttributeHierarchiesService {
            throw new NotSupported("not supported");
        },
        exportDefinitions(): IWorkspaceExportDefinitionsService {
            throw new NotSupported("not supported");
        },
        dataFilters(): IDataFiltersService {
            throw new NotSupported("not supported");
        },
        logicalModel(): IWorkspaceLogicalModelService {
            throw new NotSupported("not supported");
        },
        automations(): IWorkspaceAutomationService {
            return new DummyWorkspaceAutomationService(workspace);
        },
        genAI(): IGenAIService {
            return {
                getChatThread(): IChatThread {
                    return new DummyGenAIChatThread();
                },
                getSemanticSearchQuery(): ISemanticSearchQuery {
                    return new DummySemanticSearchQueryBuilder(workspace);
                },
                async semanticSearchIndex(): Promise<void> {
                    throw new NotSupported("not supported");
                },
                async getLlmEndpoints(): Promise<ILlmEndpointBase[]> {
                    throw new NotSupported("not supported");
                },
                getMemoryItems() {
                    throw new NotSupported("not supported");
                },
                getAnalyticsCatalog() {
                    return new DummyAnalyticsCatalogService();
                },
                getSemanticQuality() {
                    return new DummySemanticQualityService();
                },
            };
        },
    };
}

function dummyDescriptor(workspaceId: string): IWorkspaceDescriptor {
    return {
        id: workspaceId,
        title: "Title",
        description: "Description",
        isDemo: false,
    };
}

class DummyExecutionFactory extends AbstractExecutionFactory {
    constructor(
        private readonly config: DummyBackendConfig,
        workspace: string,
    ) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition, options?: IPreparedExecutionOptions): IPreparedExecution {
        return dummyPreparedExecution(def, this, this.config, options?.context);
    }
}

function dummyExecutionResult(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
    context?: IExecutionContext,
): IExecutionResult {
    const fp = defFingerprint(definition) + "/emptyResult";

    function dummyRead() {
        if (config.raiseNoDataExceptions) {
            return Promise.reject(
                new NoDataError(
                    "Empty data view from dummy backend",
                    config.raiseNoDataExceptions === "with-data-view"
                        ? dummyDataView(definition, result, config)
                        : undefined,
                ),
            );
        }

        return Promise.resolve(dummyDataView(definition, result, config));
    }

    const result: IExecutionResult = {
        definition,
        dimensions: [],
        context,
        readAll(): Promise<IDataView> {
            return dummyRead();
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            return dummyRead();
        },
        readForecastAll(): Promise<IForecastResult> {
            throw new NotSupported("Forecasting is not supported in dummy backend.");
        },
        readAnomalyDetectionAll(): Promise<IAnomalyDetectionResult> {
            throw new NotSupported("Anomaly detection is not supported in dummy backend.");
        },
        readClusteringAll(): Promise<IClusteringResult> {
            throw new NotSupported("Clustering is not supported in dummy backend.");
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IExecutionResult): boolean {
            return fp === other.fingerprint();
        },
        export(_: IExportConfig): Promise<IExportResult> {
            throw new NotSupported("...");
        },
        transform(): IPreparedExecution {
            return executionFactory.forDefinition(definition, { context });
        },
        withSignal(_signal: AbortSignal): IExecutionResult {
            throw new NotSupported("canceling is not supported in dummy backend");
        },
    };

    return result;
}

function dummyPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
    context?: IExecutionContext,
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        context,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim), { context });
        },
        withSorting(...items: ISortItem[]): IPreparedExecution {
            return executionFactory.forDefinition(defWithSorting(definition, items), { context });
        },
        withDateFormat(dateFormat: string): IPreparedExecution {
            return executionFactory.forDefinition(defWithDateFormat(definition, dateFormat), { context });
        },
        withBuckets(...buckets: IBucket[]) {
            return executionFactory.forDefinition(defWithBuckets(definition, ...buckets), { context });
        },
        withSignal(_signal: AbortSignal): IPreparedExecution {
            return dummyPreparedExecution(definition, executionFactory, config, context);
        },
        execute(): Promise<IExecutionResult> {
            return Promise.resolve(dummyExecutionResult(definition, executionFactory, config, context));
        },
        explain<T extends ExplainType | undefined>(): IExplainProvider<T> {
            console.warn("Backend does not support explain mode");
            return {
                data: () => Promise.reject(new Error(`Backend does not support explain mode data call.`)),
                download: () => Promise.resolve(),
            };
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return isEqual(this.definition, other.definition);
        },
        withExecConfig(config: IExecutionConfig): IPreparedExecution {
            if (!isEmpty(config?.dataSamplingPercentage)) {
                console.warn("Backend does not support data sampling, result will be not affected");
            }
            return executionFactory.forDefinition(definition, { context });
        },
        withContext(newContext: IExecutionContext): IPreparedExecution {
            return dummyPreparedExecution(definition, executionFactory, config, newContext);
        },
    };
}

class DummyWorkspaceCatalogFactory implements IWorkspaceCatalogFactory {
    constructor(
        public readonly workspace: string,
        public readonly options: IWorkspaceCatalogFactoryOptions = {
            types: ["attribute", "measure", "fact", "dateDataset", "attributeHierarchy"],
            excludeTags: [],
            includeTags: [],
            loadGroups: true,
        },
        public signal?: AbortSignal,
    ) {}

    public withOptions(options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new DummyWorkspaceCatalogFactory(this.workspace, newOptions, this.signal);
    }

    public forDataset(dataset: ObjRef): IWorkspaceCatalogFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            types,
        });
    }

    public includeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            includeTags: tags,
        });
    }

    public excludeTags(tags: ObjRef[]): IWorkspaceCatalogFactory {
        return this.withOptions({
            excludeTags: tags,
        });
    }

    public withGroups(loadGroups: boolean): IWorkspaceCatalogFactory {
        return this.withOptions({
            loadGroups,
        });
    }

    public withSignal(signal: AbortSignal): IWorkspaceCatalogFactory {
        return new DummyWorkspaceCatalogFactory(this.workspace, this.options, signal);
    }

    public load(): Promise<IWorkspaceCatalog> {
        return Promise.resolve(new DummyWorkspaceCatalog(this.workspace));
    }
}

class DummyWorkspaceCatalog implements IWorkspaceCatalog {
    constructor(public readonly workspace: string) {}

    public allItems(): CatalogItem[] {
        return [];
    }

    public attributes(): ICatalogAttribute[] {
        return [];
    }

    public availableItems(): IWorkspaceCatalogAvailableItemsFactory {
        return new DummyWorkspaceCatalogAvailableItemsFactory(this.workspace);
    }

    public dateDatasets(): ICatalogDateDataset[] {
        return [];
    }

    public facts(): ICatalogFact[] {
        return [];
    }

    public groups(): ICatalogGroup[] {
        return [];
    }

    public measures(): ICatalogMeasure[] {
        return [];
    }

    public attributeHierarchies(): ICatalogAttributeHierarchy[] {
        return [];
    }
}

class DummyWorkspaceCatalogAvailableItemsFactory implements IWorkspaceCatalogAvailableItemsFactory {
    constructor(
        public readonly workspace: string,
        public readonly options: IWorkspaceCatalogWithAvailableItemsFactoryOptions = {
            items: [],
            excludeTags: [],
            insight: undefined,
            dataset: undefined,
            production: false,
            includeDateGranularities: [],
            includeTags: [],
            loadGroups: false,
            types: [],
        },
        public signal?: AbortSignal,
    ) {}

    public excludeTags(excludeTags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            excludeTags,
        });
    }

    //eslint-disable-next-line sonarjs/no-identical-functions
    public forDataset(dataset: ObjRef): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            dataset,
        });
    }

    public forInsight(insight: IInsightDefinition): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            insight,
        });
    }

    public forItems(items: IAttributeOrMeasure[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            items,
        });
    }

    //eslint-disable-next-line sonarjs/no-identical-functions
    public forTypes(types: CatalogItemType[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            types,
        });
    }

    public includeTags(includeTags: ObjRef[]): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            includeTags,
        });
    }

    public load(): Promise<IWorkspaceCatalogWithAvailableItems> {
        return Promise.resolve(new DummyWorkspaceCatalogWithAvailableItems(this.workspace));
    }

    //eslint-disable-next-line sonarjs/no-identical-functions
    public withGroups(loadGroups: boolean): IWorkspaceCatalogAvailableItemsFactory {
        return this.withOptions({
            loadGroups,
        });
    }

    public withOptions(
        options: Partial<IWorkspaceCatalogWithAvailableItemsFactoryOptions>,
    ): IWorkspaceCatalogAvailableItemsFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new DummyWorkspaceCatalogAvailableItemsFactory(this.workspace, newOptions, this.signal);
    }

    public withSignal(signal: AbortSignal): IWorkspaceCatalogAvailableItemsFactory {
        return new DummyWorkspaceCatalogAvailableItemsFactory(this.workspace, this.options, signal);
    }
}

class DummyWorkspaceCatalogWithAvailableItems implements IWorkspaceCatalogWithAvailableItems {
    constructor(public readonly workspace: string) {}

    public allAvailableItems(): CatalogItem[] {
        return [];
    }

    public allItems(): CatalogItem[] {
        return [];
    }

    public attributes(): ICatalogAttribute[] {
        return [];
    }

    public availableAttributes(): ICatalogAttribute[] {
        return [];
    }

    public availableDateDatasets(): ICatalogDateDataset[] {
        return [];
    }

    public availableFacts(): ICatalogFact[] {
        return [];
    }

    public availableMeasures(): ICatalogMeasure[] {
        return [];
    }

    public dateDatasets(): ICatalogDateDataset[] {
        return [];
    }

    public facts(): ICatalogFact[] {
        return [];
    }

    public groups(): ICatalogGroup[] {
        return [];
    }

    public measures(): ICatalogMeasure[] {
        return [];
    }

    public attributeHierarchies(): ICatalogAttributeHierarchy[] {
        return [];
    }

    public availableAttributeHierarchies(): ICatalogAttributeHierarchy[] {
        return [];
    }
}

class DummyOrganization implements IOrganization {
    constructor(public organizationId: string) {}

    getDescriptor(): Promise<IOrganizationDescriptor> {
        return Promise.resolve({
            id: this.organizationId,
            title: "dummy organization",
        });
    }

    // eslint-disable-next-line sonarjs/no-identical-functions
    updateDescriptor(): Promise<IOrganizationDescriptor> {
        return Promise.resolve({
            id: this.organizationId,
            title: "dummy organization",
        });
    }

    securitySettings(): ISecuritySettingsService {
        return {
            scope: `/gdc/domains/${this.organizationId}`,
            isUrlValid(_url: string, _context: ValidationContext): Promise<boolean> {
                return Promise.resolve(true);
            },
            isDashboardPluginUrlValid(_url: string, _workspace: string): Promise<boolean> {
                return Promise.resolve(true);
            },
        };
    }

    styling(): IOrganizationStylingService {
        const resolveTheme = (theme: IThemeDefinition): Promise<IThemeMetadataObject> => {
            return Promise.resolve({
                type: "theme",
                id: "theme_id",
                title: "Theme 1",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                ref: idRef("theme_id"),
                uri: "theme_uri",
                theme: theme.theme,
            });
        };

        const resolveColorPalette = (
            colorPalette: IColorPaletteDefinition,
        ): Promise<IColorPaletteMetadataObject> =>
            Promise.resolve({
                type: "colorPalette",
                id: "color_palette_id",
                title: "Color Palette 1",
                description: "",
                production: true,
                deprecated: false,
                unlisted: false,
                ref: idRef("color_palette_id"),
                uri: "color_palette_uri",
                colorPalette: colorPalette.colorPalette,
            });

        return {
            getThemes: () => Promise.resolve([]),
            getActiveTheme: () => Promise.resolve(undefined),
            setActiveTheme: () => Promise.resolve(),
            clearActiveTheme: () => Promise.resolve(),
            createTheme: resolveTheme,
            updateTheme: resolveTheme,
            deleteTheme: () => Promise.resolve(),
            getColorPalettes: () => Promise.resolve([]),
            getActiveColorPalette: () => Promise.resolve(undefined),
            setActiveColorPalette: () => Promise.resolve(),
            clearActiveColorPalette: () => Promise.resolve(),
            createColorPalette: resolveColorPalette,
            updateColorPalette: resolveColorPalette,
            deleteColorPalette: () => Promise.resolve(),
        };
    }

    settings(): IOrganizationSettingsService {
        return {
            setWhiteLabeling: () => Promise.resolve(),
            setLocale: () => Promise.resolve(),
            setMetadataLocale: () => Promise.resolve(),
            setFormatLocale: () => Promise.resolve(),
            setSeparators: () => Promise.resolve(),
            setActiveLlmEndpoint: () => Promise.resolve(),
            deleteActiveLlmEndpoint: () => Promise.resolve(),
            setTimezone: () => Promise.resolve(),
            setDateFormat: () => Promise.resolve(),
            setWeekStart: () => Promise.resolve(),
            setFiscalCalendar: () => Promise.resolve(),
            setTheme: () => Promise.resolve(),
            setColorPalette: () => Promise.resolve(),
            setOpenAiConfig: () => Promise.resolve(),
            setDashboardFiltersApplyMode: () => Promise.resolve(),
            deleteTheme: () => Promise.resolve(),
            deleteColorPalette: () => Promise.resolve(),
            getSettings: () => Promise.resolve({}),
            setAlertDefault: () => Promise.resolve(),
            setAttachmentSizeLimit: () => Promise.resolve(),
            setMaxZoomLevel: () => Promise.resolve(),
            setMetricFormatOverride: () => Promise.resolve(),
            setActiveCalendars: () => Promise.resolve(),
        };
    }

    permissions(): IOrganizationPermissionService {
        return {
            getOrganizationPermissionForUser: () => Promise.resolve([]),
            getOrganizationPermissionForUserGroup: () => Promise.resolve([]),
            updateOrganizationPermissions: () => Promise.resolve(),
            getPermissionsForUser: () =>
                Promise.resolve({ workspacePermissions: [], dataSourcePermissions: [] }),
            getPermissionsForUserGroup: () =>
                Promise.resolve({ workspacePermissions: [], dataSourcePermissions: [] }),
            assignPermissions: () => Promise.resolve(),
            revokePermissions: () => Promise.resolve(),
        };
    }

    users(): IOrganizationUserService {
        return {
            createUser: () => {
                throw new NotSupported("not supported");
            },
            getUsersQuery: () => {
                throw new NotSupported("not supported");
            },
            getUserGroupsQuery: () => {
                throw new NotSupported("not supported");
            },
            addUsersToUserGroups: () => Promise.resolve(),
            createUserGroup: () => Promise.resolve(),
            deleteUsers: () => Promise.resolve(),
            deleteUserGroups: () => Promise.resolve(),
            getUser: () => Promise.resolve(undefined),
            getUserGroup: () => Promise.resolve(undefined),
            getUserGroups: () => Promise.resolve([]),
            getUserGroupsOfUser: () => Promise.resolve([]),
            getUsersOfUserGroup: () => Promise.resolve([]),
            getUsers: () => Promise.resolve([]),
            getUsersSummary: () => Promise.resolve([]),
            getUsersByEmail: () => Promise.resolve([]),
            removeUsersFromUserGroups: () => Promise.resolve(),
            updateUser: () => Promise.resolve(),
            updateUserGroup: () => Promise.resolve(),
        };
    }

    notificationChannels(): IOrganizationNotificationChannelService {
        return {
            testNotificationChannel: () =>
                Promise.resolve({
                    successful: true,
                }),
            getNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
            createNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
            updateNotificationChannel: () => Promise.resolve({} as INotificationChannelMetadataObject),
            deleteNotificationChannel: () => Promise.resolve(),
            getNotificationChannelsQuery: () => {
                throw new NotSupported("not supported");
            },
        };
    }

    llmEndpoints(): IOrganizationLlmEndpointsService {
        const dummyEndpoint: ILlmEndpointOpenAI = {
            id: "dummyLlmEndpoint",
            title: "Dummy Llm Endpoint",
            provider: "OPENAI",
            model: "gpt-4o-mini",
        };

        return {
            getCount: () => Promise.resolve(0),
            getAll: () => Promise.resolve([]),
            deleteLlmEndpoint: () => Promise.resolve(),
            getLlmEndpoint: () =>
                Promise.resolve({
                    ...dummyEndpoint,
                }),
            createLlmEndpoint: () =>
                Promise.resolve({
                    ...dummyEndpoint,
                }),
            updateLlmEndpoint: () =>
                Promise.resolve({
                    ...dummyEndpoint,
                }),
            patchLlmEndpoint: () =>
                Promise.resolve({
                    ...dummyEndpoint,
                }),
            testLlmEndpoint: () =>
                Promise.resolve({
                    success: true,
                }),
        };
    }

    public notifications(): IOrganizationNotificationService {
        return {
            markNotificationAsRead: () => Promise.reject(new NotSupported("not supported")),
            markAllNotificationsAsRead: () => Promise.reject(new NotSupported("not supported")),
            getNotificationsQuery: () => {
                throw new NotSupported("not supported");
            },
        };
    }

    public automations(): IOrganizationAutomationService {
        return {
            getAutomationsQuery: (_options?) => {
                throw new NotSupported("not supported");
            },
            deleteAutomation: () => Promise.resolve(),
            deleteAutomations: () => Promise.resolve(),
            pauseAutomation: () => Promise.resolve(),
            resumeAutomation: () => Promise.resolve(),
            pauseAutomations: () => Promise.resolve(),
            resumeAutomations: () => Promise.resolve(),
            unsubscribeAutomation: () => Promise.resolve(),
            unsubscribeAutomations: () => Promise.resolve(),
        };
    }
}

class DummyWorkspaceSettingsService implements IWorkspaceSettingsService {
    constructor(public readonly workspace: string) {}

    getSettings(): Promise<IWorkspaceSettings> {
        return Promise.resolve({
            workspace: this.workspace,
            testSetting: "test_value",
        });
    }

    getSettingsForCurrentUser(): Promise<IUserWorkspaceSettings> {
        return Promise.resolve({
            workspace: this.workspace,
            testSetting: "test_value",
            userId: "test_user_id",
            locale: "test_locale",
            separators: {
                thousand: ",",
                decimal: ".",
            },
        });
    }

    setAlertDefault(_value: IAlertDefault): Promise<void> {
        return Promise.resolve();
    }

    setLocale(_locale: string): Promise<void> {
        return Promise.resolve();
    }

    setMetadataLocale(_locale: string): Promise<void> {
        return Promise.resolve();
    }

    setFormatLocale(_locale: string): Promise<void> {
        return Promise.resolve();
    }

    setSeparators(_separators: ISeparators): Promise<void> {
        return Promise.resolve();
    }

    setActiveLlmEndpoint(_endpoint: string): Promise<void> {
        return Promise.resolve();
    }

    setTimezone(_timezone: string): Promise<void> {
        return Promise.resolve();
    }

    setDateFormat(_dateFormat: string): Promise<void> {
        return Promise.resolve();
    }

    setWeekStart(_weekStart: string): Promise<void> {
        return Promise.resolve();
    }

    setFiscalCalendar(_fiscalYear: IFiscalYear): Promise<void> {
        return Promise.resolve();
    }

    setActiveCalendars(_calendars: IActiveCalendars): Promise<void> {
        return Promise.resolve();
    }

    setDashboardFiltersApplyMode(_dashboardFiltersApplyMode: DashboardFiltersApplyMode): Promise<void> {
        return Promise.resolve();
    }

    deleteDashboardFiltersApplyMode(): Promise<void> {
        return Promise.resolve();
    }

    setEnableAiOnData(_enabled: boolean): Promise<void> {
        return Promise.resolve();
    }

    setTheme(_themeId: string): Promise<void> {
        return Promise.resolve();
    }

    setColorPalette(_colorPaletteId: string): Promise<void> {
        return Promise.resolve();
    }

    deleteTheme(): Promise<void> {
        return Promise.resolve();
    }

    deleteColorPalette(): Promise<void> {
        return Promise.resolve();
    }

    setMetricFormatOverride(_override: IMetricFormatOverrideSetting): Promise<void> {
        return Promise.resolve();
    }

    deleteMetricFormatOverride(): Promise<void> {
        return Promise.resolve();
    }
}

class DummyElementsQueryResult implements IElementsQueryResult {
    constructor(
        public items: IAttributeElement[],
        public limit: number,
        public offset: number,
        public totalCount: number,
    ) {}

    next(): Promise<IPagedResource<IAttributeElement>> {
        throw new NotSupported("not supported");
    }

    goTo(_pageIndex: number): Promise<IPagedResource<IAttributeElement>> {
        throw new NotSupported("not supported");
    }

    all(): Promise<IAttributeElement[]> {
        throw new NotSupported("not supported");
    }

    allSorted(
        _compareFn: (a: IAttributeElement, b: IAttributeElement) => number,
    ): Promise<IAttributeElement[]> {
        throw new NotSupported("not supported");
    }
}

class DummyElementsQuery implements IElementsQuery {
    public offset: number = 0;
    public limit: number = 50;

    constructor(
        public readonly workspace: string,
        public readonly ref: ObjRef,
    ) {}

    withLimit(limit: number): IElementsQuery {
        this.limit = limit;
        return this;
    }

    withOffset(offset: number): IElementsQuery {
        this.offset = offset;
        return this;
    }

    withAttributeFilters(_filters: IElementsQueryAttributeFilter[]): IElementsQuery {
        throw new NotSupported("not supported");
    }

    withMeasures(_measures: IMeasure<IMeasureDefinitionType>[]): IElementsQuery {
        throw new NotSupported("not supported");
    }

    withAvailableElementsOnly(_validateBy: ObjRef[]): IElementsQuery {
        throw new NotSupported("not supported");
    }

    withOptions(_options: IElementsQueryOptions): IElementsQuery {
        throw new NotSupported("not supported");
    }

    query = async (): Promise<IElementsQueryResult> => {
        return new DummyElementsQueryResult([], this.limit, this.offset, 0);
    };

    withDateFilters(_filters: (IRelativeDateFilter | IAbsoluteDateFilter)[]): IElementsQuery {
        throw new NotSupported("not supported");
    }

    withSignal(_: AbortSignal): IElementsQuery {
        throw new NotSupported("not supported");
    }
}

class DummyElementsQueryFactory implements IElementsQueryFactory {
    constructor(public readonly workspace: string) {}

    forDisplayForm(ref: ObjRef): IElementsQuery {
        return new DummyElementsQuery(this.workspace, ref);
    }

    forFilter(
        _filter: FilterWithResolvableElements,
        _dateFilterDisplayForm?: ObjRef | undefined,
    ): IFilterElementsQuery {
        throw new NotSupported("not supported");
    }
}

class DummyWorkspaceAttributesService implements IWorkspaceAttributesService {
    constructor(public readonly workspace: string) {}

    elements(): IElementsQueryFactory {
        return new DummyElementsQueryFactory(this.workspace);
    }

    async getAttributeDisplayForm(ref: ObjRef): Promise<IAttributeDisplayFormMetadataObject> {
        return {
            attribute: idRef("dummyAttribute"),
            deprecated: false,
            description: "Dummy attribute",
            id: isIdentifierRef(ref) ? ref.identifier : "dummyDisplayForm",
            production: true,
            ref,
            title: "Dummy display form",
            type: "displayForm",
            unlisted: false,
            uri: isUriRef(ref) ? ref.uri : `/gdc/md/${ref.identifier}`,
        };
    }

    getAttributeDisplayForms(refs: ObjRef[]): Promise<IAttributeDisplayFormMetadataObject[]> {
        return Promise.all(refs.map((ref) => this.getAttributeDisplayForm(ref)));
    }

    getAttribute(_ref: ObjRef): Promise<IAttributeMetadataObject> {
        throw new NotSupported("not supported");
    }

    updateAttributeMeta(
        _: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IAttributeMetadataObject> {
        throw new NotSupported("not supported");
    }

    async getAttributeByDisplayForm(ref: ObjRef): Promise<IAttributeMetadataObject> {
        return {
            deprecated: false,
            description: "Dummy attribute",
            displayForms: [
                {
                    attribute: idRef("dummyAttribute"),
                    deprecated: false,
                    description: "Dummy attribute",
                    id: isIdentifierRef(ref) ? ref.identifier : "dummyDisplayForm",
                    production: true,
                    ref,
                    title: "Dummy display form",
                    type: "displayForm",
                    unlisted: false,
                    uri: isUriRef(ref) ? ref.uri : `/gdc/md/${ref.identifier}`,
                },
            ],
            id: "dummyAttribute",
            production: true,
            ref: idRef("dummyAttribute"),
            title: "Dummy attribute",
            type: "attribute",
            unlisted: false,
            uri: "/gdc/md/dummyAttribute",
        };
    }

    getAttributes(_refs: ObjRef[]): Promise<IAttributeMetadataObject[]> {
        throw new NotSupported("not supported");
    }

    getCommonAttributes(_attributeRefs: ObjRef[]): Promise<ObjRef[]> {
        throw new NotSupported("not supported");
    }

    getCommonAttributesBatch(_attributesRefsBatch: ObjRef[][]): Promise<ObjRef[][]> {
        throw new NotSupported("not supported");
    }

    getAttributeDatasetMeta(_ref: ObjRef): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }

    getAttributesWithReferences(_refs: ObjRef[]): Promise<IAttributeWithReferences[]> {
        throw new NotSupported("not supported");
    }

    getConnectedAttributesByDisplayForm(_ref: ObjRef): Promise<ObjRef[]> {
        throw new NotSupported("Not supported");
    }

    getAttributesQuery(): IAttributesQuery {
        return new DummyAttributesQuery();
    }
}

class DummyWorkspaceMeasuresService implements IWorkspaceMeasuresService {
    constructor(public readonly workspace: string) {}

    async computeKeyDrivers(): Promise<IMeasureKeyDrivers> {
        throw new NotSupported("not supported");
    }

    createMeasure(measure: IMeasureMetadataObjectDefinition): Promise<IMeasureMetadataObject> {
        return Promise.resolve({
            id: "test_metric_id",
            uri: "test_metric_id",
            ref: idRef("test_metric_id", "measure"),
            type: "measure",
            title: measure.title || "",
            description: measure.description || "",
            deprecated: measure.deprecated || false,
            expression: measure.expression || "",
            format: measure.format || "",
            production: measure.production || false,
            isLocked: measure.isLocked || false,
            unlisted: measure.unlisted || false,
        });
    }

    deleteMeasure(_measureRef: ObjRef): Promise<void> {
        return Promise.resolve(undefined);
    }

    getMeasureExpressionTokens(_ref: ObjRef): Promise<IMeasureExpressionToken[]> {
        return Promise.resolve([]);
    }

    getMeasureReferencingObjects(_measureRef: ObjRef): Promise<IMeasureReferencing> {
        return Promise.resolve({});
    }

    updateMeasure(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        return Promise.resolve({ ...measure });
    }

    updateMeasureMeta(measure: IMeasureMetadataObject): Promise<IMeasureMetadataObject> {
        return Promise.resolve({ ...measure });
    }

    getMeasuresQuery(): IMeasuresQuery {
        return new DummyMeasuresQuery();
    }

    getMeasure(ref: ObjRef): Promise<IMeasureMetadataObject> {
        return Promise.resolve({
            id: "test_metric_id",
            uri: "test_metric_id",
            ref: ref,
            type: "measure",
            title: "Test metric",
            description: "Test metric description",
            deprecated: false,
            expression: "",
            format: "",
            production: false,
            isLocked: false,
            unlisted: false,
        });
    }

    getConnectedAttributes(_definition: IMeasure): Promise<ObjRef[]> {
        return Promise.resolve([]);
    }
}

class DummyWorkspaceDatasetsService implements IWorkspaceDatasetsService {
    constructor(public readonly workspace: string) {}

    public async getDatasets(): Promise<IDataset[]> {
        return [];
    }

    public async getAllDatasetsMeta(): Promise<IMetadataObject[]> {
        return [];
    }

    public getDataSets(refs: ObjRef[]): Promise<IDataSetMetadataObject[]> {
        return Promise.all(refs.map((ref) => this.getDataset(ref)));
    }

    public async getDataset(ref: ObjRef): Promise<IDataSetMetadataObject> {
        const id = isIdentifierRef(ref) ? ref.identifier : "dummyDataset";

        return {
            id,
            uri: isUriRef(ref) ? ref.uri : `/gdc/md/${id}`,
            ref,
            title: "Dummy dataset",
            description: "Dummy dataset",
            production: true,
            deprecated: false,
            unlisted: false,
            type: "dataSet",
            isLocked: false,
        };
    }

    public async updateDatasetMeta(
        dataSet: Partial<IMetadataObjectBase> & IMetadataObjectIdentity,
    ): Promise<IDataSetMetadataObject> {
        const existing = await this.getDataset(dataSet.ref);

        return {
            ...existing,
            ...dataSet,
            type: "dataSet",
        };
    }

    public getDatasetsQuery(): IDatasetsQuery {
        return new DummyDatasetsQuery();
    }
}

class DummyWorkspaceAutomationService implements IWorkspaceAutomationService {
    constructor(public readonly workspace: string) {}

    async computeKeyDrivers(): Promise<IMeasureKeyDrivers> {
        throw new NotSupported("not supported");
    }

    createAutomation(
        automation: IAutomationMetadataObjectDefinition,
        _options?: IGetAutomationOptions,
        _widgetExecution?: IExecutionDefinition,
        _overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        return Promise.resolve({
            ...automation,
            id: automation.id ?? "automation_id",
            uri: automation.id ?? "automation_id",
            ref: idRef(automation.id ?? "automation_id", "automation"),
            type: "automation",
        } as IAutomationMetadataObject);
    }

    deleteAutomation(_id: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    deleteAutomations(_ids: string[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    unsubscribeAutomations(_ids: string[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    pauseAutomation(_id: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    pauseAutomations(_ids: string[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    resumeAutomation(_id: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    resumeAutomations(_ids: string[]): Promise<void> {
        return Promise.resolve(undefined);
    }

    getAutomation(id: string, _options?: IGetAutomationOptions): Promise<IAutomationMetadataObject> {
        return Promise.resolve({
            id: id,
            uri: id,
            ref: idRef(id, "automation"),
            type: "automation",
            exportDefinitions: [],
            deprecated: false,
            production: true,
            description: "",
            title: "",
            unlisted: false,
            details: {
                subject: "",
                message: "",
            },
        } as IAutomationMetadataObject);
    }

    getAutomations(_options?: IGetAutomationsOptions): Promise<IAutomationMetadataObject[]> {
        return Promise.resolve([
            {
                id: "automation_id",
                uri: "automation_id",
                ref: idRef("automation_id", "automation"),
                type: "automation",
                exportDefinitions: [],
                deprecated: false,
                production: true,
                description: "",
                title: "",
                unlisted: false,
                details: {
                    subject: "",
                    message: "",
                },
            },
        ] as IAutomationMetadataObject[]);
    }

    updateAutomation(
        automation: IAutomationMetadataObject,
        _options?: IGetAutomationOptions,
        _widgetExecution?: IExecutionDefinition,
        _overrides?: IRawExportCustomOverrides,
    ): Promise<IAutomationMetadataObject> {
        return Promise.resolve({
            exportDefinitions: [],
            details: {
                subject: "",
                message: "",
            },
            ...automation,
        } as IAutomationMetadataObject);
    }

    unsubscribeAutomation(_id: string): Promise<void> {
        return Promise.resolve(undefined);
    }

    getAutomationsQuery(): IAutomationsQuery {
        return new DummyAutomationsQuery();
    }
}

class DummyAutomationsQuery implements IAutomationsQuery {
    private settings: {
        size: number;
        page: number;
        author: string | null;
        user: string | null;
        recipient: string | null;
        externalRecipient: string | null;
        dashboard: string | null;
        status: string | null;
        filter: { title?: string };
        sort: NonNullable<unknown>;
        type: AutomationType | undefined;
        totalCount: number | undefined;
        authorFilterType: AutomationFilterType;
        recipientFilterType: AutomationFilterType;
        dashboardFilterType: AutomationFilterType;
        statusFilterType: AutomationFilterType;
    } = {
        size: 100,
        page: 0,
        author: null,
        user: null,
        recipient: null,
        externalRecipient: null,
        dashboard: null,
        status: null,
        filter: {},
        sort: {},
        type: undefined,
        totalCount: undefined,
        authorFilterType: "exact",
        recipientFilterType: "exact",
        dashboardFilterType: "exact",
        statusFilterType: "exact",
    };

    query(): Promise<IAutomationsQueryResult> {
        return Promise.resolve(
            new DummyAutomationsQueryResult([], this.settings.size, this.settings.page, 0),
        );
    }

    async queryAll(): Promise<IAutomationMetadataObject[]> {
        const firstQuery = await this.query();
        return firstQuery.all();
    }

    withFilter(filter: { title?: string }): IAutomationsQuery {
        this.settings.filter = filter;
        return this;
    }

    withPage(page: number): IAutomationsQuery {
        this.settings.page = page;
        return this;
    }

    withSize(size: number): IAutomationsQuery {
        this.settings.size = size;
        return this;
    }

    withSorting(sort: string[]): IAutomationsQuery {
        this.settings.sort = sort;
        return this;
    }

    withType(type: AutomationType): IAutomationsQuery {
        this.settings.type = type;
        return this;
    }

    withAuthor(author: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.author = author;
        this.settings.authorFilterType = filterType;
        return this;
    }

    withRecipient(recipient: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.recipient = recipient;
        this.settings.recipientFilterType = filterType;
        return this;
    }

    withExternalRecipient(externalRecipient: string): IAutomationsQuery {
        this.settings.externalRecipient = externalRecipient;
        return this;
    }

    withUser(user: string): IAutomationsQuery {
        this.settings.user = user;
        return this;
    }

    withDashboard(dashboard: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.dashboard = dashboard;
        this.settings.dashboardFilterType = filterType;
        return this;
    }

    withStatus(status: string, filterType = "exact" as AutomationFilterType): IAutomationsQuery {
        this.settings.status = status;
        this.settings.statusFilterType = filterType;
        return this;
    }
}

class DummyAutomationsQueryResult implements IAutomationsQueryResult {
    constructor(
        public items: IAutomationMetadataObject[],
        public limit: number,
        public offset: number,
        public totalCount: number,
    ) {}

    all(): Promise<IAutomationMetadataObject[]> {
        throw new NotSupported("not supported");
    }

    allSorted(
        _compareFn: (a: IAutomationMetadataObject, b: IAutomationMetadataObject) => number,
    ): Promise<IAutomationMetadataObject[]> {
        throw new NotSupported("not supported");
    }

    goTo(_pageIndex: number): Promise<IPagedResource<IAutomationMetadataObject>> {
        throw new NotSupported("not supported");
    }

    next(): Promise<IPagedResource<IAutomationMetadataObject>> {
        throw new NotSupported("not supported");
    }
}

function createEmptyPagedResource<T>(): IPagedResource<T> {
    const emptyPage: IPagedResource<T> = {
        items: [],
        limit: 50,
        offset: 0,
        totalCount: 0,
        async next() {
            return emptyPage;
        },
        async goTo() {
            return emptyPage;
        },
        async all() {
            return [];
        },
        async allSorted() {
            return [];
        },
    };
    return emptyPage;
}

class DummyDashboardsQuery implements IDashboardsQuery {
    query(): Promise<IDashboardsQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IListedDashboard>());
    }

    withFilter(): IDashboardsQuery {
        return this;
    }

    withInclude(): IDashboardsQuery {
        return this;
    }

    withMetaInclude(): IDashboardsQuery {
        return this;
    }

    withMethod(): IDashboardsQuery {
        return this;
    }

    withOrigin(): IDashboardsQuery {
        return this;
    }

    withPage(): IDashboardsQuery {
        return this;
    }

    withSize(): IDashboardsQuery {
        return this;
    }

    withSorting(): IDashboardsQuery {
        return this;
    }
}

class DummyInsightsQuery implements IInsightsQuery {
    query(): Promise<IInsightsQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IInsight>());
    }

    withFilter(): IInsightsQuery {
        return this;
    }

    withInclude(): IInsightsQuery {
        return this;
    }

    withMethod(): IInsightsQuery {
        return this;
    }

    withOrigin(): IInsightsQuery {
        return this;
    }

    withPage(): IInsightsQuery {
        return this;
    }

    withSize(): IInsightsQuery {
        return this;
    }

    withSorting(): IInsightsQuery {
        return this;
    }
}

class DummyFactsQuery implements IFactsQuery {
    query(): Promise<IFactsQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IFactMetadataObject>());
    }

    withFilter(): IFactsQuery {
        return this;
    }

    withInclude(): IFactsQuery {
        return this;
    }

    withMethod(): IFactsQuery {
        return this;
    }

    withOrigin(): IFactsQuery {
        return this;
    }

    withPage(): IFactsQuery {
        return this;
    }

    withSize(): IFactsQuery {
        return this;
    }

    withSorting(): IFactsQuery {
        return this;
    }
}

class DummyAttributesQuery implements IAttributesQuery {
    query(): Promise<IAttributesQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IAttributeMetadataObject>());
    }

    withFilter(): IAttributesQuery {
        return this;
    }

    withInclude(): IAttributesQuery {
        return this;
    }

    withMethod(): IAttributesQuery {
        return this;
    }

    withOrigin(): IAttributesQuery {
        return this;
    }

    withPage(): IAttributesQuery {
        return this;
    }

    withSize(): IAttributesQuery {
        return this;
    }

    withSorting(): IAttributesQuery {
        return this;
    }
}

class DummyMeasuresQuery implements IMeasuresQuery {
    query(): Promise<IMeasuresQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IMeasureMetadataObject>());
    }

    withFilter(): IMeasuresQuery {
        return this;
    }

    withInclude(): IMeasuresQuery {
        return this;
    }

    withMethod(): IMeasuresQuery {
        return this;
    }

    withOrigin(): IMeasuresQuery {
        return this;
    }

    withPage(): IMeasuresQuery {
        return this;
    }

    withSize(): IMeasuresQuery {
        return this;
    }

    withSorting(): IMeasuresQuery {
        return this;
    }
}

class DummyDatasetsQuery implements IDatasetsQuery {
    query(): Promise<IDatasetsQueryResult> {
        return Promise.resolve(createEmptyPagedResource<IDataSetMetadataObject>());
    }

    withFilter(): IDatasetsQuery {
        return this;
    }

    withInclude(): IDatasetsQuery {
        return this;
    }

    withMethod(): IDatasetsQuery {
        return this;
    }

    withOrigin(): IDatasetsQuery {
        return this;
    }

    withPage(): IDatasetsQuery {
        return this;
    }

    withSize(): IDatasetsQuery {
        return this;
    }

    withSorting(): IDatasetsQuery {
        return this;
    }
}

class DummyWorkspaceDashboardsService implements IWorkspaceDashboardsService {
    constructor(public readonly workspace: string) {}

    getDashboardsQuery(): IDashboardsQuery {
        return new DummyDashboardsQuery();
    }

    getDashboards(_options?: IGetDashboardOptions): Promise<IListedDashboard[]> {
        throw new NotSupported("not supported");
    }

    getDashboard(
        _ref: ObjRef,
        _filterContextRef?: ObjRef,
        _options?: IGetDashboardOptions,
    ): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    getDashboardWithReferences(
        _ref: ObjRef,
        _filterContextRef?: ObjRef,
        _options?: IGetDashboardOptions,
        _types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardWithReferences> {
        throw new NotSupported("not supported");
    }

    getDashboardReferencedObjects(
        _dashboard: IDashboard,
        _types?: SupportedDashboardReferenceTypes[],
    ): Promise<IDashboardReferences> {
        throw new NotSupported("not supported");
    }

    getFilterContextByExportId(
        _exportId: string,
        _type: "visual" | "slides" | undefined,
        _tabId?: string,
    ): Promise<{ filterContext?: IFilterContext; title?: string; hideWidgetTitles?: boolean } | null> {
        throw new NotSupported("not supported");
    }

    createDashboard(_dashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    updateDashboard(_dashboard: IDashboard, _updatedDashboard: IDashboardDefinition): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    updateDashboardMeta(
        _updatedDashboard: IDashboardObjectIdentity & Partial<IDashboardBase>,
    ): Promise<IDashboard> {
        throw new NotSupported("not supported");
    }

    deleteDashboard(_ref: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    exportDashboardToPdf(
        _ref: ObjRef,
        _filters?: FilterContextItem[],
        _filtersByTab?: FiltersByTab,
        _options?: IDashboardExportPdfOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    exportDashboardToPresentation(
        _ref: ObjRef,
        _format: "PDF" | "PPTX",
        _filters?: FilterContextItem[],
        _filtersByTab?: FiltersByTab,
        _options?: IDashboardExportPresentationOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    exportDashboardToImage(
        _ref: ObjRef,
        _filters?: FilterContextItem[],
        _filtersByTab?: FiltersByTab,
        _options?: IDashboardExportImageOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    exportDashboardToTabular(
        _ref: ObjRef,
        _options?: IDashboardExportTabularOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    exportDashboardToCSVRaw(
        _definition: IExecutionDefinition,
        _fileName: string,
        _customOverrides?: IRawExportCustomOverrides,
        _options?: IDashboardExportRawOptions,
    ): Promise<IExportResult> {
        throw new NotSupported("not supported");
    }

    createScheduledMail(
        _scheduledMail: IScheduledMailDefinition,
        _exportFilterContext?: IFilterContextDefinition,
    ): Promise<IScheduledMail> {
        throw new NotSupported("not supported");
    }

    updateScheduledMail(
        _ref: ObjRef,
        _scheduledMail: IScheduledMailDefinition,
        _filterContextRef?: ObjRef,
    ): Promise<void> {
        throw new NotSupported("not supported");
    }

    deleteScheduledMail(_ref: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    getScheduledMailsForDashboard(
        _ref: ObjRef,
        _options?: IGetScheduledMailOptions,
    ): Promise<IScheduledMail[]> {
        throw new NotSupported("not supported");
    }

    getScheduledMailsCountForDashboard(_ref: ObjRef): Promise<number> {
        throw new NotSupported("not supported");
    }

    getAllWidgetAlertsForCurrentUser(): Promise<IWidgetAlert[]> {
        throw new NotSupported("not supported");
    }

    getDashboardWidgetAlertsForCurrentUser(_ref: ObjRef): Promise<IWidgetAlert[]> {
        throw new NotSupported("not supported");
    }

    getWidgetAlertsCountForWidgets(_refs: ObjRef[]): Promise<IWidgetAlertCount[]> {
        throw new NotSupported("not supported");
    }

    createWidgetAlert(_alert: IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("not supported");
    }

    updateWidgetAlert(_alert: IWidgetAlert | IWidgetAlertDefinition): Promise<IWidgetAlert> {
        throw new NotSupported("not supported");
    }

    deleteWidgetAlert(_ref: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    deleteWidgetAlerts(_refs: ObjRef[]): Promise<void> {
        throw new NotSupported("not supported");
    }

    getWidgetReferencedObjects(
        _widget: IWidget,
        _types?: SupportedWidgetReferenceTypes[],
    ): Promise<IWidgetReferences> {
        throw new NotSupported("not supported");
    }

    getResolvedFiltersForWidget(
        _widget: IWidget,
        _filters: IFilter[],
        _attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> {
        throw new NotSupported("not supported");
    }

    getResolvedFiltersForWidgetWithMultipleDateFilters(
        _widget: IWidget,
        _commonDateFilters: IDateFilter[],
        _otherFilters: IFilter[],
        _attributeFilterConfigs: IDashboardAttributeFilterConfig[],
    ): Promise<IFilter[]> {
        throw new NotSupported("not supported");
    }

    getDashboardPlugins(_options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin[]> {
        throw new NotSupported("not supported");
    }

    getDashboardPlugin(_ref: ObjRef, _options?: IGetDashboardPluginOptions): Promise<IDashboardPlugin> {
        throw new NotSupported("not supported");
    }

    createDashboardPlugin(_plugin: IDashboardPluginDefinition): Promise<IDashboardPlugin> {
        throw new NotSupported("not supported");
    }

    deleteDashboardPlugin(_ref: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    getDashboardPermissions(_ref: ObjRef): Promise<IDashboardPermissions> {
        throw new NotSupported("not supported");
    }

    validateDashboardsExistence(_dashboardRefs: ObjRef[]): Promise<IExistingDashboard[]> {
        throw new NotSupported("not supported");
    }

    getFilterViewsForCurrentUser(_dashboardRef: ObjRef): Promise<IDashboardFilterView[]> {
        throw new NotSupported("not supported");
    }

    createFilterView(_filterView: IDashboardFilterViewSaveRequest): Promise<IDashboardFilterView> {
        throw new NotSupported("not supported");
    }

    deleteFilterView(_ref: ObjRef): Promise<void> {
        throw new NotSupported("not supported");
    }

    setFilterViewAsDefault(_ref: ObjRef, _isDefault: boolean): Promise<void> {
        throw new NotSupported("not supported");
    }
}

class DummyWorkspaceInsightsService implements IWorkspaceInsightsService {
    constructor(public readonly workspace: string) {}

    getInsightsQuery(): IInsightsQuery {
        return new DummyInsightsQuery();
    }

    getInsights(): Promise<IInsightsQueryResult> {
        throw new NotSupported("not supported");
    }

    getInsight(): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    getInsightWithCatalogItems(): Promise<never> {
        throw new NotSupported("not supported");
    }

    createInsight(): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    updateInsight(): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    updateInsightMeta(): Promise<IInsight> {
        throw new NotSupported("not supported");
    }

    deleteInsight(): Promise<void> {
        throw new NotSupported("not supported");
    }

    getInsightReferencedObjects(): Promise<never> {
        throw new NotSupported("not supported");
    }

    getInsightReferencingObjects(): Promise<never> {
        throw new NotSupported("not supported");
    }

    getInsightWithAddedFilters(): Promise<never> {
        throw new NotSupported("not supported");
    }

    getVisualizationClass(): Promise<never> {
        throw new NotSupported("not supported");
    }

    getVisualizationClasses(): Promise<never> {
        throw new NotSupported("not supported");
    }
}

class DummyWorkspaceFactsService implements IWorkspaceFactsService {
    constructor(public readonly workspace: string) {}

    getFactsQuery(): IFactsQuery {
        return new DummyFactsQuery();
    }

    getFactDatasetMeta(): Promise<IMetadataObject> {
        throw new NotSupported("not supported");
    }

    getFact(): Promise<IFactMetadataObject> {
        throw new NotSupported("not supported");
    }

    updateFactMeta(): Promise<IFactMetadataObject> {
        throw new NotSupported("not supported");
    }
}
