// (C) 2021-2024 GoodData Corporation

/**
 * Entitlement name
 *
 * @public
 */
export type IEntitlementsName =
    | "CacheStrategy"
    | "Contract"
    | "CustomTheming"
    | "ExtraCache"
    | "ManagedOIDC"
    | "UiLocalization"
    | "Tier"
    | "UserCount"
    | "PdfExports"
    | "UnlimitedUsers"
    | "UnlimitedWorkspaces"
    | "WhiteLabeling"
    | "WorkspaceCount"
    | "Hipaa"
    | "UserTelemetryDisabled"
    | "MaxAutomationRecipients"
    | "MaxAutomations"
    | "MaxDailyScheduledActions"
    | "MinimumRecurrence";

/**
 * Entitlement descriptor
 *
 * @public
 */
export interface IEntitlementDescriptor {
    /**
     * License entitlement name
     */
    name: IEntitlementsName;

    /**
     * Optional value provided for the entitlement, for example workspace or user counts
     * for the respective entitlement names
     */
    value?: string;

    /**
     * Expiration date string of the entitlement returned as YYYY-MM-DD, used for
     * example with"Contract" entitlement
     */
    expiry?: string;
}
