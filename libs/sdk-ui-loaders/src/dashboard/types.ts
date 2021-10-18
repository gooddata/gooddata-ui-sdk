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
     * `staticOnly` mode
     *
     * The loader expects that it is running inside an application that depends on the `@gooddata/sdk-ui-dashboard`
     * package. Furthermore the loader will initialize dashboard with only those plugins that are part of
     * the application and passed via `extraPlugins` property. Plugins that are linked with the dashboard
     * will be ignored.
     *
     * This mode is suitable during plugin development
     *
     * `adaptive` mode
     *
     * In this mode, loader will first inspect the dashboard and then act based on the dashboard setup:
     *
     * -  If the dashboard stored on the analytical backend is configured to use some plugins, the loader will dynamically
     *    load the dashboard engine required by those plugins and then dynamically load the plugins.
     *    It will then initialize the dashboard engine with the loaded plugins and any plugins that are
     *    passed via the `extraPlugins` property.
     *
     * -  If the dashboard is not configured to use any plugins, the loader will fall back to `staticOnly`
     *    behavior.
     *
     * Default loadingMode is `adaptive`.
     */
    loadingMode?: "adaptive" | "staticOnly";

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
