// (C) 2024-2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

export const OrganizationContext = createContext<string | undefined>(undefined);
OrganizationContext.displayName = "OrganizationContext";

/**
 * Properties of the organization provider.
 *
 * @public
 */
export interface IOrganizationProviderProps {
    /**
     * Organization identifier.
     */
    organization?: string;

    /**
     * Children to render.
     */
    children?: ReactNode;
}

/**
 * Organization context provider.
 *
 * @public
 */
export function OrganizationProvider({ organization, children }: IOrganizationProviderProps) {
    return <OrganizationContext.Provider value={organization}>{children}</OrganizationContext.Provider>;
}

/**
 * Hook to get organization identifier provided to {@link OrganizationProvider}.
 *
 * @returns organization identifier or undefined if not set
 * @public
 */
export const useOrganization = (): string | undefined => {
    return useContext(OrganizationContext);
};
