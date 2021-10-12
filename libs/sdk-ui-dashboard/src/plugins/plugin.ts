// (C) 2021 GoodData Corporation

import { IDashboardCustomizer, IDashboardEventHandling } from "./customizer";
import { DashboardContext } from "../model";

/**
 * @alpha
 */
export type DashboardPluginDescriptor = {
    /**
     * Author of the plugin. This should ideally contain name and contact (email) for the author.
     */
    readonly author: string;

    /**
     * Specify human-readable name of the plugin.
     */
    readonly displayName: string;

    /**
     * Version of the plugin. At this point, the version is included for diagnostic purposes. It may
     * be whatever string the author sees fit. We recommend, however, to use semantic versioning.
     */
    readonly version: string;

    /**
     * Optionally specify human-readable short description of the plugin. This is typically a one- or two-line description
     * of the plugin, what it brings, what it does.
     */
    readonly shortDescription?: string;

    /**
     * Human-readable long description of the plugin.
     */
    readonly longDescription?: string;

    /**
     * Developer-assigned name of the plugin that will be used
     *
     * If not specified the debug name falls back to display name.
     */
    readonly debugName?: string;

    /**
     * Minimum version of dashboard engine that this plugin supports.
     */
    readonly minEngineVersion: "bundled";

    /**
     * Greatest version of the dashboard engine that this plugin supports.
     */
    readonly maxEngineVersion?: "bundled";
};

/**
 * This is the raw, low-level interface that the dashboard plugins need to implement. Through this interface
 * the plugin communicates its metadata and provides functions that will be used by dashboard loader to
 * obtain plugins customizations and contributions to apply on top of the Dashboard Component.
 *
 * @remarks see {@link DashboardPluginV1}
 *
 * @alpha
 */
export interface IDashboardPluginContract_V1 extends DashboardPluginDescriptor {
    /**
     * Version of the SPI that is realized by the plugin.
     */
    readonly _pluginVersion: "1.0";

    /**
     * This function will be called right after the plugin's asset are loaded. The plugin may do some early
     * initialization and parameter parsing at this point.
     *
     * Note that the parameterization that can be specified for the dashboard-plugin link can be edited
     * freely by the dashboard creator - and may thus be incorrect. If this function throws any exception, then
     * the dashboard loading will fall back to no-parameterization.
     *
     * If this function is not specified, then any parameters specified on the dashboard-plugin link will be
     * ignored.

     * @param ctx - dashboard context into which this plugin was loaded
     * @param parameters - parameters that the dashboard specifies on its link to this plugin; these parameters
     *  are
     */
    onPluginLoaded?(ctx: DashboardContext, parameters?: string): void;

    /**
     * This function will be called before the dashboard initialization and rendering starts. At this point,
     * the plugin can use:
     *
     * -  the `customize` API to add its contribution to the dashboard; modify how rendering is done, add custom
     *    content and so on
     * -  the `eventing` API to add domain event handlers or subscribe to infrastructural events emitted
     *    by the dashboard
     *
     * Notes:
     *
     * -  The plugin code MAY hold onto the `eventing` API and use it event after the registration is finished
     *    to ad-hoc add or remove event handlers.
     * -  The plugin code SHOULD NOT perform any customizations using the `customize` API after its registration
     *    completes. All plugin customizations and contributions must be registered at this point. Trying to
     *    register additional customizations or contributions after the registration will be ignored.
     *
     * @param ctx - dashboard context into which this plugin was loaded
     * @param customize - API through which you can register dashboard customizations; the customize API
     *  should not be used after the registration completes
     * @param eventing - API through which plugin can add or remove domain event handlers or subscribe to
     *  infrastructural events; it is safe to hold onto the eventing API and use it at later points to
     *  add or remove event handlers
     */
    register(ctx: DashboardContext, customize: IDashboardCustomizer, eventing: IDashboardEventHandling): void;

    /**
     * This function will be called when user navigates away from the dashboard that uses an instance of
     * this plugin. At this point, the plugin SHOULD perform any essential cleanup.
     *
     * @param ctx - dashboard context into which this plugin was loaded
     */
    onPluginUnload?(ctx: DashboardContext): Promise<void>;
}

/**
 * Abstract base class for the Dashboard Plugin. Each plugin should extend this class and implement at least
 * the {@link DashboardPluginV1.register} method.
 *
 * @alpha
 */
export abstract class DashboardPluginV1 implements IDashboardPluginContract_V1 {
    public readonly _pluginVersion = "1.0";
    public readonly minEngineVersion = "bundled";
    public readonly maxEngineVersion = "bundled";
    public abstract readonly author: string;
    public abstract readonly displayName: string;
    public abstract readonly version: string;

    public abstract register(
        ctx: DashboardContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandling,
    ): void;
}
