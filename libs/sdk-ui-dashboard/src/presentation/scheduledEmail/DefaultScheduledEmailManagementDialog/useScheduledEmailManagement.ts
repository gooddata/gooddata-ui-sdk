// (C) 2022 GoodData Corporation

import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import {
    selectCanManageScheduledMail,
    selectCurrentUser,
    selectDashboardRef,
    useDashboardSelector,
} from "../../../model";

interface IUseScheduledEmailManagementProps {
    /**
     * Callback to be called, when emails fail to load.
     */
    onError?: (error: GoodDataSdkError) => void;
}

export const useScheduledEmailManagement = (props: IUseScheduledEmailManagementProps) => {
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const currentUser = useDashboardSelector(selectCurrentUser);
    const canManageScheduledMail = useDashboardSelector(selectCanManageScheduledMail);
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const promise = async () => {
        const scheduledEmails = await effectiveBackend
            .workspace(effectiveWorkspace)
            .dashboards()
            .getScheduledMailsForDashboard(dashboardRef!, {
                createdByCurrentUser: !canManageScheduledMail,
            });

        return { scheduledEmails, currentUserEmail: currentUser.email };
    };

    return useCancelablePromise({ promise, onError: props.onError }, [
        effectiveBackend,
        effectiveWorkspace,
        canManageScheduledMail,
        currentUser,
        dashboardRef,
    ]);
};
