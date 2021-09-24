// (C) 2021 GoodData Corporation

import { IDashboardCustomizationProps, IDashboardEventing, IDashboardThemingProps } from "../presentation";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { DashboardEventType, IDashboardEvent } from "../model";
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

export type InitialDashboardPluginContext = Omit<IDashboardPluginContext, "pluginParameters">;

/**
 * This is the raw, low-level interface that the dashboard plugins need to implement. Through this interface
 * the plugin communicates its metadata and provides functions that will be used by dashboard loader to
 * obtain plugins customizations and contributions to apply on top of the Dashboard Component.
 *
 * @remarks see {@link AbstractDashboardPlugin}
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
     * This function will be called before the dashboard rendering starts. The plugin can provide its instance
     * of {@link IDashboardCustomizationProps} that can be used to influence rendering of the different parts
     * of the dashboard. This is how the plugin can provide implementations of custom widgets or custom
     * visualizations.
     *
     * The plugin MAY introspect the customization constructed so far and then return its own customization props. The
     * merging of the customizations is not the responsibility of the plugin or this function.
     *
     * If this function is undefined or its return value is undefined, then this plugin does not contribute any customization - which is valid.
     *
     * @param pluginCtx - context in which this plugin operates
     * @param propsSoFar - contains customization props constructed so far during the dashboard initialization process; the
     *  function MUST NOT modify these props. The props are provided here in case the plugin wants to introspect existing
     *  customization and alter its own behavior based on it.
     *
     * @returns this plugin's contribution to the dashboard customization props; if undefined, there is no contribution
     */
    createCustomizationProps?(
        pluginCtx: IDashboardPluginContext,
        propsSoFar: Readonly<IDashboardCustomizationProps>,
    ): IDashboardCustomizationProps | undefined;

    /**
     * This function will be called before the dashboard rendering starts. The plugin can provide its instance
     * of {@link IDashboardThemingProps} that can be used to influence the theme applied for this dashboard.
     *
     * The plugin MAY introspect the theme constructed so far and then return its own customization props. The
     * merging of the theme is not the responsibility of the plugin or this function.
     *
     * @param pluginCtx - context in which this plugin operates
     * @param themeSoFar - contains theme constructed so far during the dashboard initialization process; the
     *  function MUST NOT modify these props. The props are provided here in case the plugin wants to introspect existing
     *  customization and alter its own behavior based on it.
     */
    createThemingProps?(
        pluginCtx: IDashboardPluginContext,
        themeSoFar: Readonly<IDashboardThemingProps>,
    ): IDashboardThemingProps | undefined;

    /**
     * This function will be called to obtain callbacks that the plugin wants to register with the dashboard.
     *
     * @param pluginCtx - context in which this plugin operates
     */
    createEventingProps?(pluginCtx: IDashboardPluginContext): IDashboardEventing | undefined;

    /**
     * This function will be called right before the dashboard rendering starts. The plugin can provide a React
     * component that will be added as child of the Dashboard itself. The dashboard will render this custom
     * component right above the dashboard layout itself and below the filter bar.
     *
     * @param pluginCtx - context in which this plugin operates
     */
    getDashboardChildComponent?(pluginCtx: IDashboardPluginContext): React.ComponentType;
}

export abstract class DashboardPluginV1 implements IDashboardPlugin {
    public readonly _spiVersion = "1.0";
    public readonly minEngineVersion = "bundled";
    public readonly maxEngineVersion = "bundled";
    public abstract displayName: string;
    public abstract version: string;

    public createCustomizationProps(
        _pluginCtx: IDashboardPluginContext,
        _propsSoFar: Readonly<IDashboardCustomizationProps>,
    ): IDashboardCustomizationProps | undefined {
        return;
    }

    public createThemingProps(
        _pluginCtx: IDashboardPluginContext,
        _themeSoFar: Readonly<IDashboardThemingProps>,
    ): IDashboardThemingProps | undefined {
        return;
    }

    public createEventingProps(_pluginCtx: IDashboardPluginContext): IDashboardEventing | undefined {
        return;
    }

    public on(_eventType: DashboardEventType | "*", _handler: (evt: IDashboardEvent) => void): void {}

    public abstract initializeCustomizations(pluginCtx: IDashboardPluginContext): void;
}
