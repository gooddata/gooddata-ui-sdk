// (C) 2019-2020 GoodData Corporation
import React, { useEffect, useMemo, useState, useCallback } from "react";
import invariant from "ts-invariant";
import {
    IScheduledMailDefinition,
    IScheduledMail,
    IAnalyticalBackend,
    IFilterContextDefinition,
} from "@gooddata/sdk-backend-spi";
import { ObjRef } from "@gooddata/sdk-model";
import { GoodDataSdkError, LoadingComponent, ErrorComponent } from "@gooddata/sdk-ui";
import { Overlay } from "@gooddata/sdk-ui-kit";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { useUserWorkspacePermissions } from "../../hooks/useUserWorkspacePermissions";
import { useUserWorkspaceSettings } from "../../hooks/useUserWorkspaceSettings";
import { useSaveScheduledMail } from "../../hooks/useSaveScheduledMail";
import { useDashboard } from "../../hooks/useDashboard";

import { ScheduledMailDialogRenderer } from "./ScheduledMailDialogRenderer";
import { uriRef } from "@gooddata/sdk-model";
import { IDashboardFilter } from "../../DashboardView/types";
import { dashboardFilterToFilterContextItem } from "../utils/filters";

export type ScheduledMailDialogProps = {
    /**
     * Reference of the dashboard to be attached to the scheduled email.
     */
    dashboard: ObjRef;

    /**
     * Locale to use for localization of texts appearing in the scheduled email dialog.
     */
    locale?: string;

    /**
     * Filters to apply to the exported dashboard attached to the scheduled email.
     *
     * Note: By default, exported dashboard in the scheduled mail will use the original stored dashboard filter context,
     * with this prop, you can override it.
     */
    filters?: IDashboardFilter[];

    /**
     * Backend to work with.
     *
     * Note: the backend must come either from this property or from BackendContext. If you do not specify
     * backend here, then the component MUST be rendered within an existing BackendContext.
     */
    backend?: IAnalyticalBackend;

    /**
     * Workspace to work with.
     *
     * Note: the workspace must come either from this property or from WorkspaceContext. If you do not specify
     * workspace here, then the component MUST be rendered within an existing WorkspaceContext.
     */
    workspace?: string;

    /**
     * Callback to be called, when user submit the scheduled email dialog.
     */
    onSubmit?: (scheduledEmailDefinition: IScheduledMailDefinition) => void;

    /**
     * Callback to be called, when submitting of the scheduled email was successful.
     */
    onSubmitSuccess?: (scheduledEmail: IScheduledMail) => void;

    /**
     * Callback to be called, when submitting of the scheduled email failed.
     */
    onSubmitError?: (error: GoodDataSdkError) => void;

    /**
     * Callback to be called, when user close the scheduled email dialog.
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
        dashboard: dashboardRef,
        filters,
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

    const filterContextToSave = useMemo(() => {
        if (filters) {
            const filterContext: IFilterContextDefinition = {
                title: "filterContext",
                description: "",
                filters: filters.map(dashboardFilterToFilterContextItem),
            };

            return filterContext;
        }

        return undefined;
    }, [filters]);

    useSaveScheduledMail({
        scheduledMail: submittedScheduledMail,
        filterContext: filterContextToSave,
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
            if (onSubmit) {
                onSubmit(scheduledMail);
            }
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
        return (
            <Overlay className="gd-schedule-email-dialog-overlay" isModal positionType="fixed">
                <LoadingComponent />
            </Overlay>
        );
    }

    if (error) {
        return (
            <Overlay className="gd-schedule-email-dialog-overlay" isModal positionType="fixed">
                <ErrorComponent message={error.message} />
            </Overlay>
        );
    }

    return currentUser ? (
        <ScheduledMailDialogRenderer
            backend={backend}
            workspace={workspace}
            locale={effectiveLocale}
            canListUsersInProject={permissions?.canListUsersInProject}
            enableKPIDashboardScheduleRecipients={featureFlags?.enableKPIDashboardScheduleRecipients}
            dateFormat={featureFlags?.responsiveUiDateFormat}
            currentUser={currentUser}
            dashboard={dashboardUriRef}
            dashboardTitle={dashboard?.title}
            onSubmit={handleSubmit}
            onCancel={onCancel}
            onError={onError}
        />
    ) : null;
};
