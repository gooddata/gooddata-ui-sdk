// (C) 2019-2025 GoodData Corporation
import React from "react";

import { IAnalyticalBackend, IOrganization } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, UnexpectedSdkError, UseCancelablePromiseState } from "@gooddata/sdk-ui";

import { useFetchOrganization } from "./useFetchOrganization.js";

/**
 * @beta
 */
export type IOrganizationContext = UseCancelablePromiseState<IOrganization, GoodDataSdkError>;

/**
 * @beta
 */
const OrganizationContext = React.createContext<IOrganizationContext | null>(null);
OrganizationContext.displayName = "OrganizationContext";

/**
 * @beta
 */
export const useOrganization = () => {
    const organization = React.useContext(OrganizationContext);
    if (!organization) {
        throw new UnexpectedSdkError("useOrganization must be used within a OrganizationProvider");
    }
    return organization;
};

/**
 * @beta
 */
export interface IOrganizationProviderProps {
    backend?: IAnalyticalBackend;
    organizationId?: string;
    children?: React.ReactNode;
}

/**
 * @beta
 */
export const OrganizationProvider: React.FC<IOrganizationProviderProps> = ({
    children,
    backend,
    organizationId,
}) => {
    const organization = useFetchOrganization({ backend, organizationId });

    return <OrganizationContext.Provider value={organization}>{children}</OrganizationContext.Provider>;
};
