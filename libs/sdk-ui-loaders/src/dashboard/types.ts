// (C) 2021 GoodData Corporation
import { IDashboardBaseProps } from "@gooddata/sdk-ui-dashboard";
import { IClientWorkspaceIdentifiers } from "@gooddata/sdk-ui";
import { IEmbeddedPlugin } from "./loader";
import { ObjRef } from "@gooddata/sdk-model";

/**
 * This a specialization of {@link @gooddata/sdk-ui-dashboard#IDashboardBaseProps} interface in which the `dashboard` can only be provided
 * by reference.
 *
 * @alpha
 */
export interface IDashboardBasePropsForLoader extends Omit<IDashboardBaseProps, "dashboard"> {
    /**
     * Specify reference to an existing dashboard that should be loaded.
     */
    dashboard: ObjRef;
}

/**
 * Dashboard loading options
 * @alpha
 */
export interface IDashboardLoadOptions extends IDashboardBasePropsForLoader {
    /**
     * Loading mode to use.
     *
     * In 'dev' mode, the loader expects that it is running inside plugin development toolkit that depends
     * on `@gooddata/sdk-ui-dashboards` and that the plugin under development is linked using the `extraPlugins`
     * property.
     *
     * In 'prod' mode, the loader will dynamically load the dashboard, find what plugins are used on the dashboard and
     * then load all bundles with the appropriate engine version and with all the necessary plugins.
     *
     * The loading result is same regardless of the mode - it always includes everything that you need to
     * render a dashboard in your application.
     */
    mode?: "prod" | "dev";

    /**
     * Optionally specify client workspace identifiers to use in order to identify exact workspace to load
     * the dashboard from. Client workspace identifiers are not applicable to all backends - only the 'bear'
     * backend supports them. They are tightly related to the Lifecycle Management feature of the 'bear'
     * backend.
     *
     * If you specify the client workspace then it has preference over all other means that can be used
     * to specify the workspace; more specifically the `workspace` prop on this object and workspace that may
     * be defined by the context will be ignored.
     */
    clientWorkspace?: IClientWorkspaceIdentifiers;

    /**
     * Optionally specify extra plugins to use during the bootstrap of the dashboard. Code for these extra
     * plugins must be available at compile time.
     */
    extraPlugins?: IEmbeddedPlugin | IEmbeddedPlugin[];
}
