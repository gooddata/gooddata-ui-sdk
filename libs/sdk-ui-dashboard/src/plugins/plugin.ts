// (C) 2021 GoodData Corporation

import { InsightComponentProvider } from "../presentation";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import {
    DashboardEventHandler,
    DashboardEventHandlerFn,
    DashboardEvents,
    DashboardEventType,
    ICustomDashboardEvent,
} from "../model";
import React from "react";

/**
 * @alpha
 */
export interface IDashboardPluginMetadata {
    /**
     * Version of the SPI that is realized by the plugin.
     */
    readonly _spiVersion: "1.0";

    /**
     * Version of the customization APIs that this plugin requires.
     */
    readonly _requiresApi: "1.0";

    /**
     * Specify human-readable name of the plugin.
     */
    readonly displayName: string;

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
     * Author of the plugin. This should ideally contain name and contact (email) for the author.
     */
    readonly author?: string;

    /**
     * Version of the plugin.
     */
    readonly version: string;

    /**
     * Minimum version of dashboard engine that this plugin supports.
     */
    readonly minEngineVersion: "bundled";

    /**
     * Greatest version of the dashboard engine that this plugin supports.
     */
    readonly maxEngineVersion?: "bundled";
}

/**
 * Provides contextual information about the environment in which the plugin executes.
 *
 * @alpha
 */
export interface IDashboardPluginContext {
    /**
     * An instance of Analytical Backend that hosts the dashboard.
     */
    readonly backend: IAnalyticalBackend;

    /**
     * Identifier of workspace that contains the dashboard.
     */
    readonly workspace: string;

    /**
     * Dashboard being rendered. This may be undefined in case when plugin is loaded for a new, yet unsaved
     * dashboard.
     */
    readonly dashboardRef?: ObjRef;

    /**
     * Plugin-specific parameters that are defined on the dashboard level. When a dashboard links a plugin to use,
     * that link can be accompanied by plugin-specific parameters that can be used for configuration of
     * the plugin for that particular dashboard.
     *
     * The content and form of the parameters is fully at discretion of the plugin.
     *
     * This property will only be available if the dashboard's link to a plugin also specifies parameterization
     * and the parameters were parsed correctly.
     */
    readonly pluginParameters?: any;
}

/**
 * @alpha
 */
export type InitialDashboardPluginContext = Omit<IDashboardPluginContext, "pluginParameters">;

/**
 * @alpha
 */
export interface IDashboardInsightCustomizer {
    /**
     * A convenience method that will register a specific React component to use for rendering
     * any insight that is tagged with the provided `tag`.
     *
     * @param tag - tag to look for on the insight
     * @param component - component to use if the tag is found
     * @returns self, for call chaining sakes
     */
    withTag(tag: string, component: React.ComponentType): IDashboardInsightCustomizer;

    /**
     * Register a provider for React components to render insights. A provider takes the insight and
     * widget that it is part of as input and is expected to return a React component that should be
     * used to render that insight.
     *
     * If the provider returns `undefined` then:
     *
     * -  if there are other providers registered, they will be called to see if they can provide
     *    a component to render the insight
     * -  if there are no other providers registered, the default, built-in component will be used.
     *
     * You may register multiple providers. They will be evaluated in the order you register them.
     *
     *
     * @remarks see the {@link IDashboardInsightCustomizer.withTag} convenience method to register components for insights
     *  with particular tags.
     * @param provider - provider to register
     * @returns self, for call chaining sakes
     */
    withCustomProvider(provider: InsightComponentProvider): IDashboardInsightCustomizer;
}

/**
 * @alpha
 */
export interface IDashboardCustomizer {
    /**
     * Customize how rendering of insights is done.
     */
    insightRendering(): IDashboardInsightCustomizer;
}

/**
 * @alpha
 */
export interface IDashboardEventHandlers {
    /**
     * Adds a handler for particular event type. Every time event of that type occurs, the provided callback
     * function will be triggered.
     *
     * @param eventType - type of the event to handle; this can be either built-event event type (see {@link DashboardEventType}), a custom
     *  event type or '*' to register handler for all events
     * @param callback - function to call when the event occurs
     */
    addEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandlers;

    /**
     * Removes a handler for particular event type. This is reverse operation to {@link IDashboardEventHandlers.addEventHandler}. In order for
     * this method to remove a handler, the arguments must be the same when you added the handler.
     *
     * E.g. it is not possible to add a handler for all events using '*' and then subtract just one particular event
     * from handling.
     *
     * @param eventType - type of the event to stop handling; this can be either built-event event type (see {@link DashboardEventType}), a custom
     *  event type or '*' to register handler for all events
     * @param callback  - originally registered callback function
     */
    removeEventHandler<TEvents extends DashboardEvents | ICustomDashboardEvent>(
        eventType: DashboardEventType | string | "*",
        callback: DashboardEventHandlerFn<TEvents>,
    ): IDashboardEventHandlers;

    /**
     * Adds a custom event handler. This is a lower-level API where the handler can include both the function to
     * evaluate events and the function to trigger when the evaluation succeeds.
     *
     * @param handler - event handler to add
     */
    addCustomEventHandler(handler: DashboardEventHandler): IDashboardEventHandlers;

    /**
     * Removes custom event handler. In order for successful removal the entire handler object must be
     * exactly the same as the one that was used when you added the handler.
     *
     * @param handler - event handler to remove
     */
    removeEventCustomHandler(handler: DashboardEventHandler): IDashboardEventHandlers;
}

/**
 * This is the raw, low-level interface that the dashboard plugins need to implement. Through this interface
 * the plugin communicates its metadata and provides functions that will be used by dashboard loader to
 * obtain plugins customizations and contributions to apply on top of the Dashboard Component.
 *
 * @remarks see {@link DashboardPluginV1}
 *
 * @alpha
 */
export interface IDashboardPlugin extends IDashboardPluginMetadata {
    /**
     * This function will be called right after the plugin's asset are loaded. The plugin may do some early
     * initialization at this point.
     *
     * @param pluginCtx - context into which this plugin was loaded; parameters are not yet parsed at this point so they
     *  will not be included in the context
     */
    onPluginLoaded?(pluginCtx: InitialDashboardPluginContext): void;

    /**
     * This function will be called if a dashboard's link to a plugin also specifies plugin-specific
     * parameterization. The responsibility of this function is to parse the parameters serialized as
     * a string into a form that is understood and expected by the plugin.
     *
     * Note that the parameterization that can be specified for the dashboard-plugin link can be edited
     * freely by the dashboard creator - and may thus be incorrect. If this function throws any exception, then
     * the dashboard loading will fall back to no-parameterization.
     *
     * If this function is not specified, then any parameters specified on the dashboard-plugin link will be
     * ignored.
     *
     * @param pluginCtx - context into which this plugin was loaded; parameters are not yet parsed at this point so they
     *  will not be included in the context
     * @param parameters - parameters to parse; serialized as a string
     */
    parsePluginParameters?(pluginCtx: InitialDashboardPluginContext, parameters: string): any | undefined;

    /**
     * This function will be called before the dashboard rendering starts. At this point, the plugin can use
     * the provided instance of `customize` to register its customizations and contributions to the dashboard and/or
     * add custom event handlers.
     *
     * If this function is undefined or its return value is undefined, then this plugin does not contribute
     * any customization - which is valid.
     *
     * @param pluginCtx - context in which this plugin operates
     * @param customize - API through which you can register dashboard customizations
     * @param handlers - an object containing event handler registration functions
     *
     * @returns this plugin's contribution to the dashboard customization props; if undefined, there is no contribution
     */
    register?(
        pluginCtx: IDashboardPluginContext,
        customize: IDashboardCustomizer,
        handlers: IDashboardEventHandlers,
    ): void;

    /**
     * This function will be called when user navigates away from the dashboard that uses an instance of
     * this plugin. At this point, the plugin SHOULD perform any essential cleanup.
     *
     * @param pluginCtx - context in which this plugin operates
     */
    onPluginUnload?(pluginCtx: IDashboardPluginContext): void;
}

/**
 * Abstract base class for the Dashboard Plugin.
 *
 * @alpha
 */
export abstract class DashboardPluginV1 implements IDashboardPlugin {
    public readonly _spiVersion = "1.0";
    public readonly _requiresApi = "1.0";
    public readonly minEngineVersion = "bundled";
    public readonly maxEngineVersion = "bundled";
    public abstract readonly displayName: string;
    public abstract readonly version: string;
}
