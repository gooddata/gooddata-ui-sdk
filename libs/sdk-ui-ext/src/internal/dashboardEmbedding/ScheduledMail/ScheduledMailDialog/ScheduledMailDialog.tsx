// (C) 2019-2020 GoodData Corporation
import React, { useEffect, useMemo, useState, useCallback } from "react";
import invariant from "ts-invariant";
import { IScheduledMailDefinition } from "@gooddata/sdk-backend-spi";

import { useCurrentUser } from "../../hooks/useCurrentUser";
import { InternalIntlWrapper } from "../../../utils/internalIntlProvider";
import { useUserWorkspacePermissions } from "../../hooks/useUserWorkspacePermissions";
import { useUserWorkspaceSettings } from "../../hooks/useUserWorkspaceSettings";
import { useSaveScheduledMail } from "../../hooks/useSaveScheduledMail";
import { useDashboard } from "../../hooks/useDashboard";

import {
    IScheduledMailDialogRendererOwnProps,
    ScheduledMailDialogRenderer,
} from "./ScheduledMailDialogRenderer";
import { uriRef } from "@gooddata/sdk-model";

export type ScheduledMailDialogProps = Omit<IScheduledMailDialogRendererOwnProps, "owner" | "dashboardTitle">;

export const ScheduledMailDialog: React.FC<ScheduledMailDialogProps> = (props) => {
    const { backend, workspace, locale, dateFormat, dashboardRef, onCancel, onError, onSubmit } = props;
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

    // TODO: there is no feedback for the user to indicate success / error, but maybe callbacks are enough
    useSaveScheduledMail({
        scheduledMail: submittedScheduledMail,
        // filterContext, TODO: RAIL-2760 check, whether filterContext is different than the original dashboard filter context
        backend,
        workspace,
    });

    const error = currentUserError ?? dashboardError ?? permissionsError ?? featureFlagsError;

    const effectiveLocale = locale ?? featureFlags?.locale;
    const isLoading = [currentUserStatus, dashboardStatus, permissionsStatus, featureFlagsStatus].some(
        (status) => status === "loading" || status === "pending",
    );

    useEffect(() => {
        if (error) {
            // onError
        }
    }, [error]);

    const handleSubmit = useCallback(
        (scheduledMail: IScheduledMailDefinition) => {
            setSubmittedScheduledMail(scheduledMail);
            onSubmit(scheduledMail);
        },
        [onSubmit],
    );

    // Bear model expects that all refs are sanitized to uriRefs
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
                owner={currentUser}
                dashboardRef={dashboardUriRef}
                dashboardTitle={dashboard?.title}
                onSubmit={handleSubmit}
                // TODO: RAIL-2760 add support for following callbacks
                // onSubmitSuccess={}
                // onSubmitError={}
                onCancel={onCancel}
                onError={onError}
            />
        </InternalIntlWrapper>
    ) : null;
};
