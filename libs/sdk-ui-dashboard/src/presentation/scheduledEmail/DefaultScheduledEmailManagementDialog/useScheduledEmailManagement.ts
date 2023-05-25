// (C) 2022 GoodData Corporation

import { IScheduledMail, IWorkspaceUser } from "@gooddata/sdk-model";
import {
    GoodDataSdkError,
    useBackendStrict,
    useCancelablePromise,
    useWorkspaceStrict,
} from "@gooddata/sdk-ui";

import {
    selectCanManageScheduledMail,
    selectDashboardRef,
    useDashboardSelector,
} from "../../../model/index.js";

export interface IScheduledEmailManagement {
    scheduledEmails: IScheduledMail[];
    users: IWorkspaceUser[];
}

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
    onSuccess: (emailManagement: IScheduledEmailManagement) => void;
}

export const useScheduledEmailManagement = (props: IUseScheduledEmailManagementProps) => {
    const { onError, onSuccess, loadScheduledMails } = props;
    const dashboardRef = useDashboardSelector(selectDashboardRef);
    const canManageScheduledMail = useDashboardSelector(selectCanManageScheduledMail);
    const effectiveBackend = useBackendStrict();
    const effectiveWorkspace = useWorkspaceStrict();

    const loadResultPromise = loadScheduledMails
        ? async (): Promise<IScheduledEmailManagement> => {
              const scheduledEmails = await effectiveBackend
                  .workspace(effectiveWorkspace)
                  .dashboards()
                  .getScheduledMailsForDashboard(dashboardRef!, {
                      loadUserData: canManageScheduledMail,
                      createdByCurrentUser: !canManageScheduledMail,
                  });

              const users = canManageScheduledMail
                  ? await effectiveBackend.workspace(effectiveWorkspace).users().queryAll()
                  : [];

              return { scheduledEmails: scheduledEmails.reverse(), users };
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
