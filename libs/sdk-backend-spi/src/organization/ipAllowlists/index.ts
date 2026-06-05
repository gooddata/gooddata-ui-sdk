// (C) 2026 GoodData Corporation

import { type IIpAllowlist, type IIpAllowlistDefinition } from "@gooddata/sdk-model";

/**
 * Service for managing organization-level IP allowlist policies.
 *
 * @alpha
 */
export interface IOrganizationIpAllowlistService {
    /**
     * Get all IP allowlist policies defined for the organization.
     *
     * @returns Promise resolved with an array of policies (empty when none exist).
     */
    getAll(): Promise<IIpAllowlist[]>;

    /**
     * Create a new IP allowlist policy.
     *
     * @param definition - definition of the policy to create
     * @returns Promise resolved with the created policy.
     */
    create(definition: IIpAllowlistDefinition): Promise<IIpAllowlist>;

    /**
     * Replace an existing IP allowlist policy (PUT semantics).
     *
     * @param definition - full definition of the policy; `id` identifies the target
     * @returns Promise resolved with the updated policy.
     */
    update(definition: IIpAllowlistDefinition): Promise<IIpAllowlist>;

    /**
     * Delete an IP allowlist policy by its identifier.
     *
     * @param id - identifier of the policy to delete
     */
    delete(id: string): Promise<void>;
}
