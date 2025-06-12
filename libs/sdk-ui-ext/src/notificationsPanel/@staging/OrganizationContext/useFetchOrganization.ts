// (C) 2024-2025 GoodData Corporation
import { IAnalyticalBackend, IOrganization } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

/**
 * @beta
 */
export interface IUseFetchOrganizationProps {
    /**
     * Analytical backend instance to use.
     *
     * - If not provided, it will be taken from the BackendProvider context.
     */
    backend?: IAnalyticalBackend;

    /**
     * Organization ID to use.
     *
     * - If not provided, organization of the currently logged in user will be used.
     */
    organizationId?: string;
}

/**
 * @beta
 */
export function useFetchOrganization({ backend, organizationId }: IUseFetchOrganizationProps) {
    const effectiveBackend = useBackendStrict(backend, "useOrganization");

    return useCancelablePromise<IOrganization, GoodDataSdkError>(
        {
            promise: () => {
                return organizationId
                    ? Promise.resolve(effectiveBackend.organization(organizationId))
                    : effectiveBackend.organizations().getCurrentOrganization();
            },
        },
        [effectiveBackend, organizationId],
    );
}
