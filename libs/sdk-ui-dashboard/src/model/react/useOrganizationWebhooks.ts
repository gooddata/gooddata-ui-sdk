// (C) 2020-2024 GoodData Corporation
import { IOrganization } from "@gooddata/sdk-backend-spi";
import { IWebhookMetadataObject } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";

interface IUseOrganizationWebhooksConfig
    extends UseCancelablePromiseCallbacks<IWebhookMetadataObject[], GoodDataSdkError> {
    /**
     * Option to filter users by the provided string.
     */
    search?: string;

    /**
     * Organization to work with.
     */
    organization?: IOrganization;
}

/**
 * Hook allowing to download workspace users
 * @param config - configuration of the hook
 * @internal
 */
export function useOrganizationWebhooks({
    search,
    organization,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseOrganizationWebhooksConfig): UseCancelablePromiseState<IWebhookMetadataObject[], any> {
    return useCancelablePromise(
        {
            promise: organization
                ? () => {
                      return organization.notificationChannels().getWebhooks();
                  }
                : null,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess,
        },
        [organization, search],
    );
}
