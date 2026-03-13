// (C) 2020-2026 GoodData Corporation

import { type IFeatureFlags, type IPermanentSettings } from "./settings.js";
import { type RemotePluggableApplicationsRegistry } from "../pluggableApplication/index.js";

/**
 * Settings are obtained from the backend and are effectively a collection of feature flags or settings with
 * concrete string or numeric value.
 *
 * @remarks
 * Settings are stored and configured on the server and typically allow
 * for a more fine-grained tuning of otherwise unified behavior.
 *
 * @public
 */
export interface ISettings extends IPermanentSettings, IFeatureFlags {
    /**
     * Registered pluggable applications.
     *
     * It is a permanent setting option, but it is lifted into this interface to prevent cyclic dependencies
     * as the RemotePluggableApplicationsRegistry references both IPermanentSettings and IFeatureFlags.
     *
     * @alpha
     */
    registeredPluggableApplications?: RemotePluggableApplicationsRegistry;

    [key: string]: number | boolean | string | object | undefined | null;
}
