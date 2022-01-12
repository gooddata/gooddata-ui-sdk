// (C) 2019-2022 GoodData Corporation
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
    CatalogItemType,
    IOrganization,
    ISecuritySettingsService,
    ValidationContext,
    IOrganizationDescriptor,
    IOrganizations,
    IWorkspaceSettings,
    IUserWorkspaceSettings,
    IAttributeDisplayFormMetadataObject,
    IAttributeMetadataObject,
    IElementsQueryFactory,
    IMetadataObject,
    IMeasureMetadataObjectDefinition,
    IMeasureExpressionToken,
    IMeasureMetadataObject,
    IMeasureReferencing,
    IWorkspaceUserGroupsQuery,
    IWorkspaceAccessControlService,
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
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
import isEmpty from "lodash/isEmpty";
import { AbstractExecutionFactory } from "../toolkit/execution";

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
 * @param config - optionally provide configuration of the backend (host/user)
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
 * @param result - optionally a result to link with the data view, if not provided an execution result will be
 *  created
 * @param config - optionally override config that will be passed to exec result that may be created for the
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
        execute(): Promise<IExecutionResult> {
            return Promise.resolve(dummyExecutionResult(definition, executionFactory, config));
        },
        explain(): Promise<void> {
            // eslint-disable-next-line no-console
            console.warn("Backend does not support explain mode");
            return Promise.resolve();
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return isEqual(this.definition, other.definition);
        },
        withExecConfig(config: IExecutionConfig): IPreparedExecution {
            if (!isEmpty(config?.dataSamplingPercentage)) {
                // eslint-disable-next-line no-console
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
            types: ["attribute", "measure", "fact", "dateDataset"],
            excludeTags: [],
            includeTags: [],
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

    public load(): Promise<IWorkspaceCatalog> {
        return Promise.resolve("draw the rest of the owl" as any);
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
}

class DummyWorkspaceAttributesService implements IWorkspaceAttributesService {
    constructor(public readonly workspace: string) {}
    elements(): IElementsQueryFactory {
        throw new NotSupported("not supported");
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
}

class DummyWorkspaceMeasuresService implements IWorkspaceMeasuresService {
    constructor(public readonly workspace: string) {}

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
