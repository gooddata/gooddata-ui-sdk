// (C) 2026 GoodData Corporation

import { type PluggableApplicationRegistryItem } from "@gooddata/sdk-model";

import { type IAppHeaderOptions } from "./mount.js";
import { type IPlatformContext } from "./platformContext.js";

/**
 * Options passed by the host into a host UI module's mount function.
 *
 * @alpha
 */
export interface IHostUiMountOptions {
    /**
     * DOM element into which the host UI should render itself.
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
     * The host UI uses this to determine which navigation item is active.
     * Updated via {@link IHostUiMountHandle.updatePathname} when the URL changes.
     */
    pathname: string;

    /**
     * Callback for requesting client-side navigation (push).
     *
     * @remarks
     * The host owns the router. When the host UI needs to navigate (e.g. menu item click),
     * it calls this callback and the host performs the actual navigation. The host then pushes
     * the new pathname back via {@link IHostUiMountHandle.updatePathname}.
     */
    navigate: (url: string) => void;

    /**
     * Callback for requesting client-side navigation with history replacement.
     *
     * @remarks
     * Works like {@link IHostUiMountOptions.navigate} but replaces the current history
     * entry instead of pushing a new one.
     */
    replace: (url: string) => void;
}

/**
 * Notification dispatched when the host runtime detects that a newer build of the host
 * application has been deployed while the user's tab is still open.
 *
 * @remarks
 * Stale tabs continue to reference content-hashed chunk URLs that no longer exist on the
 * server, so the user must reload to pick up the new build. The host UI module decides
 * how to surface this (e.g. a toast with a reload action).
 *
 * @alpha
 */
export interface INewDeploymentAvailableHostUiNotification {
    /**
     * A new build of the host application has been deployed; the user should reload to
     * avoid loading stale chunks. The host UI is expected to surface this to the user
     * (e.g. as a toast with a reload action).
     */
    type: "newDeploymentAvailable";
    /**
     * Commit hash of the newly deployed build, as detected by the host runtime.
     */
    commitHash: string;
}

/**
 * Discriminated union of out-of-band notifications the host runtime can push into the
 * host UI module after mount. Lets the runtime signal events that should affect the UI
 * without coupling it to a specific rendering.
 *
 * @remarks
 * Variants are discriminated by the `type` field. Implementations of
 * {@link IHostUiMountHandle.notify} may safely no-op for notification types they do not
 * handle, so adding a new variant is a backward-compatible change.
 *
 * @alpha
 */
export type IHostUiNotification = INewDeploymentAvailableHostUiNotification;

/**
 * Handle returned from a host UI mount for lifecycle management.
 *
 * @alpha
 */
export interface IHostUiMountHandle {
    /**
     * Unmounts the host UI and releases all resources.
     */
    unmount(): void;

    /**
     * Pushes an updated platform context into the host UI.
     *
     * @remarks
     * Called by the host whenever the context changes after initial mount.
     */
    updateContext?(ctx: IPlatformContext): void;

    /**
     * Pushes an updated list of resolved applications into the host UI.
     *
     * @remarks
     * Called by the host whenever the application list changes after initial mount.
     */
    updateApplications?(apps: PluggableApplicationRegistryItem[]): void;

    /**
     * Pushes the current pathname into the host UI.
     *
     * @remarks
     * Called by the host whenever the URL changes (e.g. after navigation or popstate).
     * The host UI uses this to update the active state of navigation items.
     */
    updatePathname?(pathname: string): void;

    /**
     * Pushes updated header options into the host UI.
     *
     * @remarks
     * Called by the host whenever the active pluggable application declares new header
     * options via its `onHeaderChange` callback. The host UI uses this to update
     * the header (e.g. help menu items) to match the active application's preferences.
     * When called with `undefined`, the host UI should revert to its default header configuration.
     */
    updateHeader?(header: IAppHeaderOptions | undefined): void;

    /**
     * Pushes the active application's page-title segment into the host UI.
     *
     * @remarks
     * Called by the host whenever the active pluggable application sets a page title via its
     * `onDocumentTitleChange` callback. The host UI composes the browser tab title as
     * `"{pageTitle} - {brand}"`. When called with `undefined`, the host UI falls back to the
     * active application's manifest title.
     */
    updateDocumentTitle?(pageTitle: string | undefined): void;

    /**
     * Returns the DOM element where the active pluggable application should be rendered.
     *
     * @remarks
     * The host uses this element as the mount container for the currently active
     * pluggable application. The host UI is responsible for creating and managing
     * this element as part of its layout.
     */
    getAppContainer(): HTMLElement;

    /**
     * Receives an out-of-band notification from the host runtime.
     *
     * @remarks
     * The host UI decides how to render the notification (toast, banner, modal, …);
     * implementations may safely no-op for notification types they do not handle.
     */
    notify?(notification: IHostUiNotification): void;
}

/**
 * Host UI mount function signature.
 *
 * @remarks
 * A host UI module must export a `mount` function conforming to this signature.
 * The function receives a container element and context data, renders the application
 * host (header, navigation, layout), and returns a handle for lifecycle management.
 *
 * The implementation is framework-agnostic — a module can use React, vanilla DOM,
 * or any other rendering approach internally.
 *
 * @alpha
 */
export type HostUiMount = (options: IHostUiMountOptions) => IHostUiMountHandle;

/**
 * Host UI module contract.
 *
 * @remarks
 * Implementations loaded via module federation or provided locally must conform
 * to this interface. The host application uses the `mount` function to render
 * the application chrome and obtain the container for the active pluggable application.
 *
 * @alpha
 */
export interface IHostUiModule {
    mount: HostUiMount;
}
