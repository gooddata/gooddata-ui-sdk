// (C) 2026 GoodData Corporation

/**
 * Definition used to create an organization IP allowlist policy.
 *
 * @alpha
 */
export interface IIpAllowlistDefinition {
    /**
     * Client-assigned identifier. Must be unique within the organization.
     */
    id: string;

    /**
     * IPv4 or IPv6 addresses and/or CIDR ranges allowed by the policy.
     * The `/0` prefix (matching the entire address space) is rejected by the backend.
     */
    allowedSources: string[];

    /**
     * Identifiers of users to which the policy applies.
     */
    userIds: string[];

    /**
     * Identifiers of user groups to which the policy applies.
     */
    userGroupIds: string[];
}

/**
 * User assigned to an IP allowlist policy, enriched with display info
 * resolved from the JSON:API `included` array on read endpoints.
 *
 * @alpha
 */
export interface IIpAllowlistAssignedUser {
    id: string;
    /**
     * Display name combined from first + last name. Empty when the user has neither.
     */
    fullName?: string;
    email?: string;
}

/**
 * User group assigned to an IP allowlist policy, enriched with display info
 * resolved from the JSON:API `included` array on read endpoints.
 *
 * @alpha
 */
export interface IIpAllowlistAssignedUserGroup {
    id: string;
    name?: string;
}

/**
 * Represents an organization IP allowlist policy returned by the backend.
 *
 * @remarks
 * On top of the create-shape {@link IIpAllowlistDefinition}, the read shape
 * exposes resolved display info for assigned users and user groups so the UI
 * can render them without an additional round-trip.
 *
 * @alpha
 */
export interface IIpAllowlist extends IIpAllowlistDefinition {
    users: IIpAllowlistAssignedUser[];
    userGroups: IIpAllowlistAssignedUserGroup[];
}
