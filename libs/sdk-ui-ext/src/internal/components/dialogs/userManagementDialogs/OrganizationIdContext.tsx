// (C) 2023 GoodData Corporation

import React from "react";
import { invariant } from "ts-invariant";

const OrganizationIdContext = React.createContext<string | undefined>(undefined);
OrganizationIdContext.displayName = "OrganizationIdContext";

export interface IOrganizationIdProviderProps {
    organizationId?: string;
    children?: React.ReactNode;
}

export const OrganizationIdProvider: React.FC<IOrganizationIdProviderProps> = ({
    organizationId,
    children,
}) => {
    return <OrganizationIdContext.Provider value={organizationId}>{children}</OrganizationIdContext.Provider>;
};

export const useOrganizationId = () => {
    const organizationId = React.useContext(OrganizationIdContext);
    invariant(
        organizationId,
        "useOrganizationId must be called in OrganizationIdProvider with initialized value!",
    );
    return organizationId;
};
