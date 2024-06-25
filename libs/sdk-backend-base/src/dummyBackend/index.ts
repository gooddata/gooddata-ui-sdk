// (C) 2019-2024 GoodData Corporation
import {
    IAnalyticalBackendConfig,
    IAuthenticatedPrincipal,
    IAnalyticalBackend,
    IAnalyticalWorkspace,
    IAuthenticationProvider,
    IDataView,
    IExecutionFactory,
    IExecutionResult,
    IExportConfig,
    IExportResult,
    IPreparedExecution,
    IUserService,
    IWorkspaceCatalog,
    IWorkspaceCatalogFactory,
    IWorkspaceCatalogFactoryOptions,
    IWorkspaceDashboardsService,
    IWorkspaceDatasetsService,
    IDateFilterConfigsQuery,
    IWorkspaceInsightsService,
    IWorkspaceAttributesService,
    IWorkspaceMeasuresService,
    IWorkspaceFactsService,
    IWorkspacePermissionsService,
    IWorkspacesQueryFactory,
    IWorkspaceSettingsService,
    IWorkspaceStylingService,
    IWorkspaceUsersQuery,
    NoDataError,
    NotSupported,
    IWorkspaceDescriptor,
    IOrganization,
    ISecuritySettingsService,
    ValidationContext,
    IOrganizations,
    IWorkspaceSettings,
    IUserWorkspaceSettings,
    IElementsQueryFactory,
    IMeasureExpressionToken,
    IMeasureReferencing,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
    IOrganizationStylingService,
    IOrganizationSettingsService,
    IExplainProvider,
    ExplainType,
    IWorkspaceCatalogAvailableItemsFactory,
    IWorkspaceCatalogWithAvailableItemsFactoryOptions,
    IWorkspaceCatalogWithAvailableItems,
    FilterWithResolvableElements,
    IElementsQuery,
    IFilterElementsQuery,
    IElementsQueryAttributeFilter,
    IElementsQueryOptions,
    IElementsQueryResult,
    IPagedResource,
    IEntitlements,
    IOrganizationPermissionService,
    IOrganizationUserService,
    IAttributeHierarchiesService,
    IDataSourcesService,
    IWorkspaceExportDefinitionsService,
    IDataFiltersService,
    IWorkspaceLogicalModelService,
    IForecastResult,
    IForecastConfig,
    IForecastView,
    IMeasureKeyDrivers,
    IAnomalyDetectionResult,
    IClusteringResult,
    IOrganizationNotificationChannelService,
    IClusteringConfig,
    IWorkspaceAutomationService,
} from "@gooddata/sdk-backend-spi";
import {
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    IExecutionConfig,
    ISortItem,
    ObjRef,
    defWithDateFormat,
    idRef,
    isIdentifierRef,
    isUriRef,
    CatalogItemType,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IMeasureMetadataObject,
    IMeasureMetadataObjectDefinition,
    IMetadataObject,
    IOrganizationDescriptor,
    IThemeMetadataObject,
    IThemeDefinition,
    IColorPaletteDefinition,
    IColorPaletteMetadataObject,
    CatalogItem,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    IInsightDefinition,
    IAttributeOrMeasure,
    IMeasure,
    IMeasureDefinitionType,
    IAttributeElement,
    ICatalogAttributeHierarchy,
    IBucket,
    defWithBuckets,
    IRelativeDateFilter,
    IAbsoluteDateFilter,
    IWebhookMetadataObjectDefinition,
    IWebhookMetadataObject,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual.js";
import isEmpty from "lodash/isEmpty.js";
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
    const execResult = result ? result : dummyExecutionResult(definition, factory, config);

    const fp = defFingerprint(definition) + "/emptyView";

    return {
        definition,
        result: execResult,
        headerItems: [],
        data: [],
        offset: [0, 0],
        count: [0, 0],
        totalCount: [0, 0],
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
        async updateDescriptor(): Promise<void> {
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
            throw new NotSupported("not supported");
        },
        settings(): IWorkspaceSettingsService {
            return new DummyWorkspaceSettingsService(workspace);
        },
        insights(): IWorkspaceInsightsService {
            throw new NotSupported("not supported");
        },
        dashboards(): IWorkspaceDashboardsService {
            throw new NotSupported("not supported");
        },
        styling(): IWorkspaceStylingService {
            throw new NotSupported("not supported");
        },
        datasets(): IWorkspaceDatasetsService {
            throw new NotSupported("not supported");
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
            throw new NotSupported("automations are not supported");
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
    constructor(private readonly config: DummyBackendConfig, workspace: string) {
        super(workspace);
    }

    public forDefinition(def: IExecutionDefinition): IPreparedExecution {
        return dummyPreparedExecution(def, this, this.config);
    }
}

function dummyExecutionResult(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
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
            return executionFactory.forDefinition(definition);
        },
    };

    return result;
}

function dummyPreparedExecution(
    definition: IExecutionDefinition,
    executionFactory: IExecutionFactory,
    config: DummyBackendConfig,
): IPreparedExecution {
    const fp = defFingerprint(definition);

    return {
        definition,
        withDimensions(...dim: Array<IDimension | DimensionGenerator>): IPreparedExecution {
            return executionFactory.forDefinition(defWithDimensions(definition, ...dim));
        },
        withSorting(...items: ISortItem[]): IPreparedExecution {
            return executionFactory.forDefinition(defWithSorting(definition, items));
        },
        withDateFormat(dateFormat: string): IPreparedExecution {
            return executionFactory.forDefinition(defWithDateFormat(definition, dateFormat));
        },
        withBuckets(...buckets: IBucket[]) {
            return executionFactory.forDefinition(defWithBuckets(definition, ...buckets));
        },
        execute(): Promise<IExecutionResult> {
            return Promise.resolve(dummyExecutionResult(definition, executionFactory, config));
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
            return executionFactory.forDefinition(definition);
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
    ) {}

    public withOptions(options: Partial<IWorkspaceCatalogFactoryOptions>): IWorkspaceCatalogFactory {
        const newOptions = {
            ...this.options,
            ...options,
        };
        return new DummyWorkspaceCatalogFactory(this.workspace, newOptions);
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
        return new DummyWorkspaceCatalogAvailableItemsFactory(this.workspace, newOptions);
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

    updateDescriptor(): Promise<void> {
        return Promise.resolve();
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
            setTimezone: () => Promise.resolve(),
            setDateFormat: () => Promise.resolve(),
            setWeekStart: () => Promise.resolve(),
            setTheme: () => Promise.resolve(),
            setColorPalette: () => Promise.resolve(),
            setOpenAiConfig: () => Promise.resolve(),
            deleteTheme: () => Promise.resolve(),
            deleteColorPalette: () => Promise.resolve(),
            getSettings: () => Promise.resolve({}),
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
            removeUsersFromUserGroups: () => Promise.resolve(),
            updateUser: () => Promise.resolve(),
            updateUserGroup: () => Promise.resolve(),
        };
    }

    notificationChannels(): IOrganizationNotificationChannelService {
        return {
            createWebhook: (webhook: IWebhookMetadataObjectDefinition) =>
                Promise.resolve({
                    ...(webhook as IWebhookMetadataObject),
                    id: "dummyWebhook",
                }),
            deleteWebhook: () => Promise.resolve(),
            getWebhook: () =>
                Promise.resolve({
                    id: "dummyWebhook",
                    name: "Dummy webhook",
                    endpoint: "https://dummy.webhook",
                    token: "dummyToken",
                    triggers: [],
                }),
            getWebhooks: () => Promise.resolve([]),
            updateWebhook: (webhook) => Promise.resolve(webhook),
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

    setLocale(_locale: string): Promise<void> {
        return Promise.resolve();
    }

    setTheme(_themeId: string): Promise<void> {
        return Promise.resolve();
    }

    setColorPalette(_colorPaletteId: string): Promise<void> {
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

    constructor(public readonly workspace: string, public readonly ref: ObjRef) {}

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
    getConnectedAttributesByDisplayForm(_ref: ObjRef): Promise<ObjRef[]> {
        throw new NotSupported("Not supported");
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
}
