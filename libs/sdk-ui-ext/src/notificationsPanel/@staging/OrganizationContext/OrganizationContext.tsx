// (C) 2019-2024 GoodData Corporation
import React from "react";
import { IAnalyticalBackend, IOrganization } from "@gooddata/sdk-backend-spi";
import { useFetchOrganization } from "./useFetchOrganization.js";
import { GoodDataSdkError, UnexpectedSdkError, UseCancelablePromiseState } from "@gooddata/sdk-ui";

export type IOrganizationContext = UseCancelablePromiseState<IOrganization, GoodDataSdkError>;

const OrganizationContext = React.createContext<IOrganizationContext | null>(null);
OrganizationContext.displayName = "OrganizationContext";

export const useOrganization = () => {
    const organization = React.useContext(OrganizationContext);
    if (!organization) {
        throw new UnexpectedSdkError("useOrganization must be used within a OrganizationProvider");
    }
    return organization;
};

export interface IOrganizationProviderProps {
    backend?: IAnalyticalBackend;
    organizationId?: string;
    children?: React.ReactNode;
}

export const OrganizationProvider: React.FC<IOrganizationProviderProps> = ({
    children,
    backend,
    organizationId,
}) => {
    const organization = useFetchOrganization({ backend, organizationId });

    return <OrganizationContext.Provider value={organization}>{children}</OrganizationContext.Provider>;
};
