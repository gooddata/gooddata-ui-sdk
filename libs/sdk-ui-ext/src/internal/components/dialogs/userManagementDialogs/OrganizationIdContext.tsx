// (C) 2023-2025 GoodData Corporation

import React from "react";

import { invariant } from "ts-invariant";

const OrganizationIdContext = React.createContext<string | undefined>(undefined);
OrganizationIdContext.displayName = "OrganizationIdContext";

export interface IOrganizationIdProviderProps {
    organizationId?: string;
    children?: React.ReactNode;
}

export function OrganizationIdProvider({ organizationId, children }: IOrganizationIdProviderProps) {
    return <OrganizationIdContext.Provider value={organizationId}>{children}</OrganizationIdContext.Provider>;
}

export const useOrganizationId = () => {
    const organizationId = React.useContext(OrganizationIdContext);
    invariant(
        organizationId,
        "useOrganizationId must be called in OrganizationIdProvider with initialized value!",
    );
    return organizationId;
};
