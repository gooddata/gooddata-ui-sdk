// (C) 2023-2025 GoodData Corporation

import {
    type IExecutionFactory,
    type IGeoService,
    type ISecuritySettingsService,
    type IWorkspaceAttributesService,
    type IWorkspaceAutomationService,
    type IWorkspaceCatalogFactory,
    type IWorkspaceDashboardsService,
    type IWorkspaceSettingsService,
} from "@gooddata/sdk-backend-spi";

/**
 * @alpha
 */
export type ExecutionDecoratorFactory = (executionFactory: IExecutionFactory) => IExecutionFactory;

/**
 * @alpha
 */
export type CatalogDecoratorFactory = (catalog: IWorkspaceCatalogFactory) => IWorkspaceCatalogFactory;

/**
 * @alpha
 */
export type SecuritySettingsDecoratorFactory = (
    securitySettings: ISecuritySettingsService,
) => ISecuritySettingsService;

/**
 * @alpha
 */
export type WorkspaceSettingsDecoratorFactory = (
    settings: IWorkspaceSettingsService,
    workspace: string,
) => IWorkspaceSettingsService;

/**
 * @alpha
 */
export type AttributesDecoratorFactory = (
    attributes: IWorkspaceAttributesService,
    workspace: string,
) => IWorkspaceAttributesService;

/**
 * @alpha
 */
export type AutomationsDecoratorFactory = (
    automations: IWorkspaceAutomationService,
    workspace: string,
) => IWorkspaceAutomationService;

/**
 * @alpha
 */
export type DashboardsDecoratorFactory = (
    dashboards: IWorkspaceDashboardsService,
    workspace: string,
) => IWorkspaceDashboardsService;

/**
 * @alpha
 */
export type GeoDecoratorFactory = (geo: IGeoService) => IGeoService;

/**
 * Provides factory functions for the different decorators (currently only supports execution
 * decorator). Input to each factory function is the original implementation from the wrapped backend, output
 * is whatever decorateur sees fit.
 *
 * @alpha
 */
export type DecoratorFactories = {
    execution?: ExecutionDecoratorFactory;
    catalog?: CatalogDecoratorFactory;
    securitySettings?: SecuritySettingsDecoratorFactory;
    workspaceSettings?: WorkspaceSettingsDecoratorFactory;
    attributes?: AttributesDecoratorFactory;
    automations?: AutomationsDecoratorFactory;
    dashboards?: DashboardsDecoratorFactory;
    geo?: GeoDecoratorFactory;
};
