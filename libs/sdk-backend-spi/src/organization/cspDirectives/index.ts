// (C) 2026 GoodData Corporation

import { type ICspDirective } from "@gooddata/sdk-model";

/**
 * Service for managing Content Security Policy directives of the organization.
 *
 * @alpha
 */
export interface IOrganizationCspDirectivesService {
    /**
     * Get all CSP directives of the organization.
     */
    getAll(): Promise<ICspDirective[]>;

    /**
     * Get CSP directive by its name.
     *
     * @param id - name of the directive
     */
    get(id: string): Promise<ICspDirective>;

    /**
     * Create a CSP directive.
     *
     * @param directive - directive to create
     */
    create(directive: ICspDirective): Promise<ICspDirective>;

    /**
     * Replace the sources of an existing CSP directive.
     *
     * @param directive - full directive; `id` identifies the target
     */
    update(directive: ICspDirective): Promise<ICspDirective>;

    /**
     * Delete a CSP directive.
     *
     * @param id - name of the directive
     */
    delete(id: string): Promise<void>;
}
