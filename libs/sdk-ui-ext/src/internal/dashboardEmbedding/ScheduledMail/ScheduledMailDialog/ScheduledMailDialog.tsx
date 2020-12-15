// (C) 2019-2020 GoodData Corporation
import React, { useEffect, useMemo, useState, useCallback } from "react";
import invariant from "ts-invariant";
import {
    IScheduledMailDefinition,
    IScheduledMail,
    IUser,
    IAnalyticalBackend,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError } from "@gooddata/sdk-ui";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { useUserWorkspacePermissions } from "../../hooks/useUserWorkspacePermissions";
import { useUserWorkspaceSettings } from "../../hooks/useUserWorkspaceSettings";
import { useSaveScheduledMail } from "../../hooks/useSaveScheduledMail";
import { useDashboard } from "../../hooks/useDashboard";

import { ScheduledMailDialogRenderer } from "./ScheduledMailDialogRenderer";
import { uriRef } from "@gooddata/sdk-model";

export type ScheduledMailDialogProps = {
    /**
     * Reference of the dashboard to be attached to the scheduled email.
     */
    dashboard: ObjRef;

    /**
     * Title of the attached dashboard. Used to create the default subject of a scheduled email.
     */
    dashboardTitle: string;

    /**
     * Author of the scheduled email - is always recipient of the scheduled email.
     */
    currentUser: IUser;

    /**
     * Date format to use in DatePicker. To check the supported tokens,
     * see the `format` method of the https://date-fns.org/ library.
     */
    dateFormat?: string;

    /**
     * Locale to use for localization of texts appearing in the scheduled email dialog.
     */
    locale?: string;

    /**
     * Has user canListUsersInProject permission?
     */
    canListUsersInProject?: boolean;

    /**
     * Is enableKPIDashboardScheduleRecipients feature flag turned on?
     */
    enableKPIDashboardScheduleRecipients?: boolean;

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the executor MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the executor MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Callback to be called, when we submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when submitting of the scheduled email was successful.
     */
    onSubmitSuccess?: (scheduledEmail: IScheduledMail) => void;

    /**
     * Callback to be called, when submitting of the scheduled email failed.
     */
    onSubmitError: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when we close the scheduled email dialog.
     */
    onCancel?: () => void;

    /**
     * Callback to be called, when error occurs.
     */
    onError?: (error: GoodDataSdkError) => void;
};

export const ScheduledMailDialog: React.FC<ScheduledMailDialogProps> = (props) => {
    const {
        backend,
        workspace,
        locale,
        dateFormat,
        dashboard: dashboardRef,
        onSubmit,
        onSubmitSuccess,
        onSubmitError,
        onCancel,
        onError,
    } = props;
    const { result: currentUser, status: currentUserStatus, error: currentUserError } = useCurrentUser({
        backend,
    });
    const { result: dashboard, status: dashboardStatus, error: dashboardError } = useDashboard({
        backend,
        workspace,
        dashboard: dashboardRef,
    });
    const {
        result: permissions,
        status: permissionsStatus,
        error: permissionsError,
    } = useUserWorkspacePermissions({ backend, workspace });
    const {
        result: featureFlags,
        status: featureFlagsStatus,
        error: featureFlagsError,
    } = useUserWorkspaceSettings({ backend, workspace });
    const [submittedScheduledMail, setSubmittedScheduledMail] = useState<IScheduledMailDefinition>();

    useSaveScheduledMail({
        scheduledMail: submittedScheduledMail,
        // filterContext, TODO: RAIL-2760 check, whether filterContext is different than the original dashboard filter context
        onSuccess: onSubmitSuccess,
        onError: onSubmitError,
        backend,
        workspace,
    });

    const error = currentUserError ?? dashboardError ?? permissionsError ?? featureFlagsError;
    const effectiveLocale = locale ?? featureFlags?.locale;
    const isLoading = [currentUserStatus, dashboardStatus, permissionsStatus, featureFlagsStatus].some(
        (status) => status === "loading" || status === "pending",
    );

    useEffect(() => {
        if (error && onError) {
            onError(error);
        }
    }, [error]);

    const handleSubmit = useCallback(
        (scheduledMail: IScheduledMailDefinition) => {
            setSubmittedScheduledMail(scheduledMail);
            onSubmit(scheduledMail);
        },
        [onSubmit],
    );

    // Bear model expects that all refs are sanitized to uriRefs.
    const dashboardUriRef = useMemo(() => (dashboard ? uriRef(dashboard.uri) : null), [dashboard]);

    if (featureFlags) {
        invariant(
            featureFlags.enableKPIDashboardSchedule,
            "Feature flag enableKPIDashboardSchedule must be enabled to make ScheduledMailDialog work properly.",
        );
    }

    if (isLoading) {
        return null;
    }

    return currentUser ? (
        <InternalIntlWrapper locale={effectiveLocale}>
            <ScheduledMailDialogRenderer
                backend={backend}
                workspace={workspace}
                locale={effectiveLocale}
                canListUsersInProject={permissions?.canListUsersInProject}
                enableKPIDashboardScheduleRecipients={featureFlags?.enableKPIDashboardScheduleRecipients}
                dateFormat={dateFormat ?? featureFlags?.responsiveUiDateFormat ?? "MM/dd/yyyy"}
                currentUser={currentUser}
                dashboard={dashboardUriRef}
                dashboardTitle={dashboard?.title}
                onSubmit={handleSubmit}
                onCancel={onCancel}
                onError={onError}
            />
        </InternalIntlWrapper>
    ) : null;
};
