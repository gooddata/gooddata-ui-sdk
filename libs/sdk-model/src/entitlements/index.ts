// (C) 2021-2025 GoodData Corporation

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
    | "DailyAlertActionCount"
    | "UnlimitedDailyAlertActions"
    | "UserTelemetryDisabled"
    | "AutomationCount"
    | "UnlimitedAutomations"
    | "AutomationRecipientCount"
    | "UnlimitedAutomationRecipients"
    | "DailyScheduledActionCount"
    | "UnlimitedDailyScheduledActions"
    | "ScheduledActionMinimumRecurrenceMinutes"
    | "FederatedIdentityManagement"
    | "AuditLogging";
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
