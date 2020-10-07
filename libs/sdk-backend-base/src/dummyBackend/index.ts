// (C) 2019-2020 GoodData Corporation
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
} from "@gooddata/sdk-backend-spi";
import {
    CatalogItemType,
    defFingerprint,
    defWithDimensions,
    defWithSorting,
    DimensionGenerator,
    IDimension,
    IExecutionDefinition,
    ISortItem,
    ObjRef,
} from "@gooddata/sdk-model";
import isEqual from "lodash/isEqual";
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
     */
    raiseNoDataExceptions: boolean;
};

/**
 *
 */
export const defaultDummyBackendConfig: DummyBackendConfig = {
    hostname: "test",
    raiseNoDataExceptions: true,
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
        capabilities: {},
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
        getDescriptor(): Promise<IWorkspaceDescriptor> {
            throw new NotSupported("not supported");
        },
        execution(): IExecutionFactory {
            return new DummyExecutionFactory(config, workspace);
        },
        catalog(): IWorkspaceCatalogFactory {
            return new DummyWorkspaceCatalogFactory(workspace);
        },
        attributes(): IWorkspaceAttributesService {
            throw new NotSupported("not supported");
        },
        measures(): IWorkspaceMeasuresService {
            throw new NotSupported("not supported");
        },
        facts(): IWorkspaceFactsService {
            throw new NotSupported("not supported");
        },
        settings(): IWorkspaceSettingsService {
            throw new NotSupported("not supported");
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
        dateFilterConfigs(): IDateFilterConfigsQuery {
            throw new NotSupported("not supported");
        },
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

    const result: IExecutionResult = {
        definition,
        dimensions: [],
        readAll(): Promise<IDataView> {
            if (config.raiseNoDataExceptions) {
                return Promise.reject(new NoDataError("Empty data view from dummy backend"));
            }

            return Promise.resolve(dummyDataView(definition, result, config));
        },
        readWindow(_1: number[], _2: number[]): Promise<IDataView> {
            if (config.raiseNoDataExceptions) {
                return Promise.reject(new NoDataError("Empty data view from dummy backend"));
            }

            return Promise.resolve(dummyDataView(definition, result, config));
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
        execute(): Promise<IExecutionResult> {
            return new Promise((r) => r(dummyExecutionResult(definition, executionFactory, config)));
        },
        fingerprint(): string {
            return fp;
        },
        equals(other: IPreparedExecution): boolean {
            return isEqual(this.definition, other.definition);
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
