// (C) 2019-2021 GoodData Corporation
import {
    CatalogItem,
    IAnalyticalBackendConfig,
    IAttributeDisplayFormMetadataObject,
    IAttributeElement,
    ICatalogAttribute,
    ICatalogDateDataset,
    ICatalogFact,
    ICatalogGroup,
    ICatalogMeasure,
    IDashboardWithReferences,
    IDateFilterConfig,
    ISettings,
    ITheme,
    IWidgetAlert,
    ValidationContext,
    IWorkspaceDescriptor,
} from "@gooddata/sdk-backend-spi";
import {
    IColorPalette,
    IExecutionDefinition,
    IInsight,
    IVisualizationClass,
    ObjRef,
    IUser,
} from "@gooddata/sdk-model";

/**
 * @internal
 */
export type RecordedRefType = "id" | "uri";

/**
 * Recorded backend allows convenient programmatic configuration of some services outcomes.
 *
 * @internal
 */
export type RecordedBackendConfig = IAnalyticalBackendConfig & {
    /**
     * Specify settings that will be returned by any settings service (e.g. workspace settings)
     */
    globalSettings?: ISettings;

    /**
     * Specify color palette to return
     */
    globalPalette?: IColorPalette;

    /**
     * Specify date filter config to return. If not specified, then the date filter config
     * resolves empty result.
     */
    dateFilterConfig?: IDateFilterConfig;

    /**
     * Optionally specify descriptor for workspace
     */
    workspaceDescriptor?: Partial<Pick<IWorkspaceDescriptor, "title" | "description" | "isDemo">>;

    /**
     * Specify theme to return
     */
    theme?: ITheme;

    /**
     * Specify which ref type should be added to recorded entities. Recording infrastructure does not
     * store 'ref'. Instead, the recorded backend can return refs as either uri or identifier, thus allowing
     * to simulate behavior of the different backend types.
     *
     * Note: this is currently implemented for executions and insights. it is not yet supported in catalog
     *
     * Default: 'uri'
     */
    useRefType?: RecordedRefType;

    /**
     * Specify validator that returns boolean for provided URL value and validation context type.
     *
     * The backend responds with `true` for every validation request when this custom validator is not setup.
     */
    securitySettingsUrlValidator?: SecuritySettingsUrlValidator;

    /**
     * Specify validator that returns boolean for provided plugin URL value and workspace where the plugin is being loaded.
     *
     * The backend responds with `true` for every validation request when this custom validator is not setup.
     */
    securitySettingsPluginUrlValidator?: SecuritySettingsPluginUrlValidator;

    /**
     * Specify function that builds organization scope from organization ID.
     *
     * The scope accessible on `ISecuritySettingsService` is constructed as `/gdc/domains/${organizationId}`
     * when this custom factory is not setup.
     */
    securitySettingsOrganizationScope?: SecuritySettingsOrganizationScope;

    /**
     * Specify user to return.
     */
    user?: IUser;

    /**
     * Specify responses to the getCommonAttributes calls. The key of the map MUST be created using the {@link objRefsToStringKey} function.
     */
    getCommonAttributesResponses?: Record<string, ObjRef[]>;

    /**
     * Optionally specify functions to apply on different types of catalog items when determining item availability.
     */
    catalogAvailability?: {
        availableAttributes?: (attributes: ICatalogAttribute[]) => ICatalogAttribute[];
        availableMeasures?: (measures: ICatalogMeasure[]) => ICatalogMeasure[];
        availableFacts?: (facts: ICatalogFact[]) => ICatalogFact[];
        availableDateDatasets?: (datasets: ICatalogDateDataset[]) => ICatalogDateDataset[];
    };
};

/**
 * @internal
 */
export type RecordingIndex = {
    executions?: {
        [fp: string]: ExecutionRecording;
    };
    metadata?: {
        catalog?: CatalogRecording;
        displayForms?: Record<string, DisplayFormRecording>;
        insights?: Record<string, InsightRecording>;
        visClasses?: VisClassesRecording;
        dashboards?: Record<string, DashboardRecording>;
    };
};

/**
 * @internal
 */
export type ExecutionRecording = {
    scenarios?: any[];
    definition: IExecutionDefinition;
    executionResult: any;
    [dataViews: string]: any;
};

/**
 * @internal
 */
export type ScenarioRecording = {
    execution: ExecutionRecording;
    scenarioIndex: number;
};

/**
 * @internal
 */
export type DisplayFormRecording = {
    obj: IAttributeDisplayFormMetadataObject;
    elements: IAttributeElement[];
};

/**
 * @internal
 */
export type InsightRecording = {
    obj: IInsight;
};

/**
 * @internal
 */
export type CatalogRecording = {
    items: CatalogItem[];
    groups: ICatalogGroup[];
};

/**
 * @internal
 */
export type VisClassesRecording = {
    items: IVisualizationClass[];
};

/**
 * @internal
 */
export type DashboardRecording = {
    obj: IDashboardWithReferences;
    alerts: IWidgetAlert[];
};

/**
 * @internal
 */
export type SecuritySettingsUrlValidator = (url: string, context: ValidationContext) => boolean;

/**
 * @internal
 */
export type SecuritySettingsPluginUrlValidator = (url: string, workspace: string) => boolean;

/**
 * @internal
 */
export type SecuritySettingsOrganizationScope = (organizationId: string) => string;
