// (C) 2022 GoodData Corporation

import { IScheduledMail } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";
import { selectCanManageScheduledMail, selectDashboardRef, useDashboardSelector } from "../../../model";

interface IUseScheduledEmailManagementProps {
    /**
     * Flag to handle data refetching logic
     */
    loadScheduledMails: boolean;

    /**
     * Callback to be called, when emails fail to load.
     */
    onError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when emails load.
     */
    onSuccess: (scheduledEmails: IScheduledMail[]) => void;
}

export const useScheduledEmailManagement = (props: IUseScheduledEmailManagementProps) => {
    const { onError, onSuccess, loadScheduledMails } = props;
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const canManageScheduledMail = useDashboardSelector(selectCanManageScheduledMail);
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const loadResultPromise = loadScheduledMails
        ? async () => {
              const scheduledEmails = await effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .getScheduledMailsForDashboard(dashboardRef!, {
                      loadUserData: canManageScheduledMail,
                      createdByCurrentUser: !canManageScheduledMail,
                  });

              const reversedScheduledEmails = scheduledEmails.reverse();

              return reversedScheduledEmails;
          }
        : null;

    return useCancelablePromise({ promise: loadResultPromise, onError, onSuccess }, [
        effectiveBackend,
        effectiveWorkspace,
        canManageScheduledMail,
        dashboardRef,
        loadScheduledMails,
    ]);
};
