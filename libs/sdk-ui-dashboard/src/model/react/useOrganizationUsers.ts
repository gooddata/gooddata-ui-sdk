// (C) 2020-2024 GoodData Corporation
import { IOrganization } from "@gooddata/sdk-backend-spi";
import { IOrganizationUser } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useCancelablePromise,
    UseCancelablePromiseCallbacks,
    UseCancelablePromiseState,
} from "@gooddata/sdk-ui";

interface IUseOrganizationUsersConfig
    extends UseCancelablePromiseCallbacks<IOrganizationUser[], GoodDataSdkError> {
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
 * Hook allowing to download organization users
 * @param config - configuration of the hook
 * @internal
 */
export function useOrganizationUsers({
    search,
    organization,
    onCancel,
    onError,
    onLoading,
    onPending,
    onSuccess,
}: IUseOrganizationUsersConfig): UseCancelablePromiseState<IOrganizationUser[], any> {
    return useCancelablePromise(
        {
            promise: organization
                ? () => {
                      return organization
                          .users()
                          .getUsersQuery()
                          .query()
                          .then((result) => result.all());
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
