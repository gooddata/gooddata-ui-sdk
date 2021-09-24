// (C) 2021 GoodData Corporation

import { IDashboardPlugin } from "./plugin";
import {
    IDashboardCustomizationProps,
    IDashboardEventing,
    IDashboardProps,
    IDashboardThemingProps,
} from "../presentation";
import { ComponentType } from "react";

/**
 * Dashboard Engine encapsulates a particular build of the `Dashboard` component and provides
 * factory methods to create the Dashboard component's customization-related props using one or more
 * plugins.
 *
 * @public
 */
export interface IDashboardEngine {
    readonly version: string;
    readonly buildTime: string;

    /**
     * Creates dashboard customization props based on contributions of one or more plugins. This factory
     * function is responsible for combining the contributions from different plugins into a single
     * instance of dashboard customization props.
     *
     * @param plugins - plugins whose contributions should be reflected in the dashboard customization props;
     *  if empty the dashboard customization props will also end up being empty
     */
    createCustomizationProps(plugins: IDashboardPlugin[]): IDashboardCustomizationProps;

    /**
     * Creates dashboard theming props based on contributions of one or more plugins. This factory
     * function is responsible for combining the theming settings from different plugins into
     * a single instance of dashboard theming props.
     *
     * @param plugins - plugins whose contributions should be reflected in the dashboard customization props;
     *  if empty the dashboard customization props will also end up being empty
     */
    createThemingProps(plugins: IDashboardPlugin[]): IDashboardThemingProps;

    /**
     * Creates dashboard eventing props based on eventing requirements coming from one or more plugins. This
     * factory function is responsible for combining the requirements from different plugins into a
     * single instance of dashboard eventing props.
     *
     * @param plugins - plugins whose eventing requirements should be reflected in the dashboard eventing props;
     *  if empty the dashboard eventing will also end up being empty
     */
    createEventingProps(plugins: IDashboardPlugin[]): IDashboardEventing;

    /**
     * Returns Dashboard component provided by this dashboard engine.
     */
    getDashboardComponent(): ComponentType<IDashboardProps>;
}
