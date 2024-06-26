// (C) 2022-2024 GoodData Corporation
import { resolveUseCancelablePromisesStatus, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { useCurrentOrganization } from "./useCurrentOrganization.js";
import { useOrganizationUsers } from "./useOrganizationUsers.js";
import { useOrganizationWebhooks } from "./useOrganizationWebhooks.js";
import { useWorkspaceAutomations } from "./useWorkspaceAutomations.js";

/**
 * Hook that handles schedule emailing data.
 *
 * @alpha
 */
export const useDashboardScheduledEmailsData = ({
    reloadId,
    onLoadError,
}: {
    reloadId: number;
    onLoadError: () => void;
}) => {
    const backend = useBackendStrict(undefined, "useDashboardScheduledEmails");
    const workspace = useWorkspaceStrict(undefined, "useDashboardScheduledEmails");
    const currentOrganizationPromise = useCurrentOrganization({ backend, onError: onLoadError });
    const organizationUsersPromise = useOrganizationUsers({
        organization: currentOrganizationPromise.result,
        onError: onLoadError,
    });
    const organizationWebhooksPromise = useOrganizationWebhooks({
        organization: currentOrganizationPromise.result,
        onError: onLoadError,
    });
    const automationsPromise = useWorkspaceAutomations({ backend, workspace, onError: onLoadError }, [
        reloadId,
    ]);
    const promisesStatus = resolveUseCancelablePromisesStatus(
        [
            currentOrganizationPromise,
            organizationUsersPromise,
            organizationWebhooksPromise,
            automationsPromise,
        ],
        { strategy: "parallel" },
    );
    const loadError = [
        currentOrganizationPromise.error,
        organizationUsersPromise.error,
        organizationWebhooksPromise.error,
        automationsPromise.error,
    ].filter(Boolean)[0];

    const isLoading = promisesStatus === "loading" || promisesStatus === "pending";
    const webhooks = organizationWebhooksPromise.result ?? [];
    const users = organizationUsersPromise.result ?? [];
    const automations = automationsPromise.result ?? [];

    return {
        isLoading,
        loadError,
        webhooks,
        automations,
        users,
    };
};
