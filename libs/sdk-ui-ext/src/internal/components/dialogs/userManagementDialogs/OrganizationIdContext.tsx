// (C) 2023-2025 GoodData Corporation

import { ReactNode, createContext, useContext } from "react";

import { invariant } from "ts-invariant";

const OrganizationIdContext = createContext<string | undefined>(undefined);
OrganizationIdContext.displayName = "OrganizationIdContext";

export interface IOrganizationIdProviderProps {
    organizationId?: string;
    children?: ReactNode;
}

export function OrganizationIdProvider({ organizationId, children }: IOrganizationIdProviderProps) {
    return <OrganizationIdContext.Provider value={organizationId}>{children}</OrganizationIdContext.Provider>;
}

export const useOrganizationId = () => {
    const organizationId = useContext(OrganizationIdContext);
    invariant(
        organizationId,
        "useOrganizationId must be called in OrganizationIdProvider with initialized value!",
    );
    return organizationId;
};
