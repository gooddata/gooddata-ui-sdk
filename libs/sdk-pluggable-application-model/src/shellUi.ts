// (C) 2026 GoodData Corporation

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";

import { type IPlatformContext } from "./platformContext.js";

/**
 * Options passed by the host into a shell UI module's mount function.
 *
 * @alpha
 */
export interface IShellUiMountOptions {
    /**
     * DOM element into which the shell UI should render itself.
     */
    container: HTMLElement;

    /**
     * Platform context snapshot provided by the host.
     */
    ctx: IPlatformContext;

    /**
     * Resolved and filtered list of pluggable applications to render in the navigation.
     */
    resolvedApplications: PluggableApplicationRegistryItem[];

    /**
     * Current pathname of the host application.
     *
     * @remarks
     * The shell UI uses this to determine which navigation item is active.
     * Updated via {@link IShellUiMountHandle.updatePathname} when the URL changes.
     */
    pathname: string;

    /**
     * Callback for requesting client-side navigation (push).
     *
     * @remarks
     * The host owns the router. When the shell UI needs to navigate (e.g. menu item click),
     * it calls this callback and the host performs the actual navigation. The host then pushes
     * the new pathname back via {@link IShellUiMountHandle.updatePathname}.
     */
    navigate: (url: string) => void;

    /**
     * Callback for requesting client-side navigation with history replacement.
     *
     * @remarks
     * Works like {@link IShellUiMountOptions.navigate} but replaces the current history
     * entry instead of pushing a new one.
     */
    replace: (url: string) => void;
}

/**
 * Handle returned from a shell UI mount for lifecycle management.
 *
 * @alpha
 */
export interface IShellUiMountHandle {
    /**
     * Unmounts the shell UI and releases all resources.
     */
    unmount(): void;

    /**
     * Pushes an updated platform context into the shell UI.
     *
     * @remarks
     * Called by the host whenever the context changes after initial mount.
     */
    updateContext?(ctx: IPlatformContext): void;

    /**
     * Pushes an updated list of resolved applications into the shell UI.
     *
     * @remarks
     * Called by the host whenever the application list changes after initial mount.
     */
    updateApplications?(apps: PluggableApplicationRegistryItem[]): void;

    /**
     * Pushes the current pathname into the shell UI.
     *
     * @remarks
     * Called by the host whenever the URL changes (e.g. after navigation or popstate).
     * The shell UI uses this to update the active state of navigation items.
     */
    updatePathname?(pathname: string): void;

    /**
     * Returns the DOM element where the active pluggable application should be rendered.
     *
     * @remarks
     * The host uses this element as the mount container for the currently active
     * pluggable application. The shell UI is responsible for creating and managing
     * this element as part of its layout.
     */
    getAppContainer(): HTMLElement;
}

/**
 * Shell UI mount function signature.
 *
 * @remarks
 * A shell UI module must export a `mount` function conforming to this signature.
 * The function receives a container element and context data, renders the application
 * shell (header, navigation, layout), and returns a handle for lifecycle management.
 *
 * The implementation is framework-agnostic — a module can use React, vanilla DOM,
 * or any other rendering approach internally.
 *
 * @alpha
 */
export type ShellUiMount = (options: IShellUiMountOptions) => IShellUiMountHandle;

/**
 * Shell UI module contract.
 *
 * @remarks
 * Implementations loaded via module federation or provided locally must conform
 * to this interface. The shell application uses the `mount` function to render
 * the application chrome and obtain the container for the active pluggable application.
 *
 * @alpha
 */
export interface IShellUiModule {
    mount: ShellUiMount;
}
