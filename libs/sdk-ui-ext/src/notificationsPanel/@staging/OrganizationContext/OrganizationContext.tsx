// (C) 2019-2025 GoodData Corporation

import { type ReactNode, createContext, useContext } from "react";

import { type IAnalyticalBackend, type IOrganization } from "@gooddata/sdk-backend-spi";
import { type GoodDataSdkError, UnexpectedSdkError, type UseCancelablePromiseState } from "@gooddata/sdk-ui";

import { useFetchOrganization } from "./useFetchOrganization.js";

/**
 * @beta
 */
export type IOrganizationContext = UseCancelablePromiseState<IOrganization, GoodDataSdkError>;

/**
 * @beta
 */
const OrganizationContext = createContext<IOrganizationContext | null>(null);
OrganizationContext.displayName = "OrganizationContext";

/**
 * @beta
 */
export const useOrganization = () => {
    const organization = useContext(OrganizationContext);
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
    children?: ReactNode;
}

/**
 * @beta
 */
export function OrganizationProvider({ children, backend, organizationId }: IOrganizationProviderProps) {
    const organization = useFetchOrganization({ backend, organizationId });

    return <OrganizationContext.Provider value={organization}>{children}</OrganizationContext.Provider>;
}
