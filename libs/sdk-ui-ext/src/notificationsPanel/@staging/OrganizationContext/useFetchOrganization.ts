// (C) 2024 GoodData Corporation
import { IAnalyticalBackend, IOrganization } from "@gooddata/sdk-backend-spi";
import { GoodDataSdkError, useBackendStrict, useCancelablePromise } from "@gooddata/sdk-ui";

/**
 * @alpha
 */
export interface IUseFetchOrganizationProps {
    /**
     * Analytical backend instance to use.
     * If not provided, it will be taken from the BackendProvider context.
     */
    backend?: IAnalyticalBackend;

    /**
     * Organization ID to use.
     * If not provided, the current organization will be used.
     */
    organizationId?: string;
}

/**
 * @alpha
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
