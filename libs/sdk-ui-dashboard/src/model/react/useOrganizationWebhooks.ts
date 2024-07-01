// (C) 2020-2024 GoodData Corporation
import { IOrganization } from "@gooddata/sdk-backend-spi";
import { IWebhookMetadataObject } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";
import { useDashboardDispatch } from "./DashboardStoreProvider.js";
import { webhooksActions } from "../store/webhooks/index.js";

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

    /**
     * Enable or disable the hook.
     */
    enable?: boolean;
}

/**
 * Hook allowing to download workspace users
 * @param config - configuration of the hook
 * @internal
 */
export function useOrganizationWebhooks({
    enable,
    search,
    organization,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseOrganizationWebhooksConfig): UseCancelablePromiseState<IWebhookMetadataObject[], any> {
    const dispatch = useDashboardDispatch();

    return useCancelablePromise(
        {
            promise:
                enable && organization
                    ? () => {
                          return organization.notificationChannels().getWebhooks();
                      }
                    : null,
            onCancel,
            onError,
            onLoading,
            onPending,
            onSuccess: (result) => {
                dispatch(webhooksActions.setWebhooks(result));
                onSuccess?.(result);
            },
        },
        [organization, search],
    );
}
