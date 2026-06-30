// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback } from "react";

import { type IAutomationMetadataObject, isWidget } from "@gooddata/sdk-model";
import { buildAutomationUrl, navigate, useWorkspaceStrict } from "@gooddata/sdk-ui";

import {
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardScheduledEmails } from "../../../model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js";
import { useWorkspaceUsers } from "../../../model/react/useWorkspaceUsers.js";
import {
    selectEnableAutomationManagement,
    selectExternalRecipient,
    selectIsEmbedded,
    selectSettings,
} from "../../../model/store/config/configSelectors.js";
import {
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../model/store/filtering/dashboardFilterSelectors.js";
import { selectDashboardId } from "../../../model/store/meta/metaSelectors.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailManagementDialogContextProvider } from "../contexts/ScheduledEmailManagementDialogContext.js";
import { ScheduledEmailDialog } from "../scheduledEmail/ScheduledEmailDialog.js";
import { ScheduledEmailManagementDialog } from "../scheduledEmail/ScheduledEmailManagementDialog.js";
import { type IScheduledEmailDialogProps } from "../scheduledEmail/types.js";
import { getAppliedDashboardFilters } from "../scheduledEmail/utils/filters.js";

import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";
import { useBuildScheduledEmailDialogContext } from "./hooks/useBuildScheduledEmailDialogContext.js";
import { useBuildScheduledEmailManagementDialogContext } from "./hooks/useBuildScheduledEmailManagementDialogContext.js";
import { useWidgetAutomationFilters } from "./hooks/useWidgetAutomationFilters.js";

type ScheduledEmailsProps = ReturnType<typeof useDashboardScheduledEmails>;

/**
 * Provides AutomationsContext to its children, built from dashboard Redux state.
 * Wraps the scheduled-email dialog subtree (both the create/edit and management dialogs reach
 * AutomationsContext through this provider).
 *
 * @internal
 */
export function ScheduledEmailAutomationsProvider({ children }: { children: ReactNode }): ReactElement {
    const automationsCtx = useBuildAutomationsContext();
    return <AutomationsContextProvider value={automationsCtx}>{children}</AutomationsContextProvider>;
}

/**
 * Connector component that reads from the dashboard Redux store and wires up
 * the scheduled-email dialog tree (create/edit and management) via context providers.
 *
 * This is the primary bridge between dashboard store state and the scheduled-email
 * dialog tree. The dialog still reads the store directly at this point —
 * contexts are provided but not yet consumed. Store reads migrate off the dialog
 * in subsequent Phase 2 tasks (A2/A3).
 *
 * AutomationsContext is provided by ScheduledEmailAutomationsProvider, which wraps this
 * connector (see ScheduledEmailAutomationsProvider in DashboardHeader).
 *
 * @internal
 */
export function ScheduledEmailConnector(): ReactElement | null {
    const se = useDashboardScheduledEmails();
    if (!se.isInitialized) {
        return null;
    }
    return <ScheduledEmailConnectorInitialized {...se} />;
}

function ScheduledEmailConnectorInitialized(se: ScheduledEmailsProps): ReactElement | null {
    const { isScheduleEmailingDialogOpen, isScheduleEmailingManagementDialogOpen } = se;

    // Defer store reads and user loading until at least one dialog is open.
    // This is a deliberate behavior alignment with AlertingConnector (GDP-3167).
    if (!isScheduleEmailingDialogOpen && !isScheduleEmailingManagementDialogOpen) {
        return null;
    }
    return <ScheduledEmailConnectorWithData se={se} />;
}

function ScheduledEmailConnectorWithData({ se }: { se: ScheduledEmailsProps }): ReactElement {
    const {
        // Shared Local State
        scheduledExportToEdit,
        // Data
        automations,
        automationsError,
        automationsLoading,
        notificationChannels,
        // Single Schedule Dialog
        isScheduleEmailingDialogOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingBack,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingCreateError,
        onScheduleEmailingSaveSuccess,
        onScheduleEmailingSaveError,
        // Management / List Dialog
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingManagementDeleteSuccess,
        onScheduleEmailingManagementDeleteError,
        widget,
        insight,
    } = se;

    const workspace = useWorkspaceStrict();
    const enableAutomationManagement = useDashboardSelector(selectEnableAutomationManagement);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const isEmbedded = useDashboardSelector(selectIsEmbedded);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const settings = useDashboardSelector(selectSettings);
    const useHostRoute =
        Boolean(settings?.enableShellApplication) && Boolean(settings?.enableShellApplication_dashboards);

    // Cross-dashboard edit routing lives in the connector (which may read router + store).
    // The management dialog only invokes this injected callback.
    const handleManagementEdit = useCallback(
        (scheduledEmail: IAutomationMetadataObject) => {
            const targetDashboardId = scheduledEmail.dashboard?.id;

            if (enableAutomationManagement && targetDashboardId && targetDashboardId !== dashboardId) {
                navigate(
                    buildAutomationUrl({
                        workspaceId: workspace,
                        dashboardId: targetDashboardId,
                        automationId: scheduledEmail.id,
                        isEmbedded,
                        useHostRoute,
                        queryParams: externalRecipientOverride
                            ? { recipient: externalRecipientOverride }
                            : undefined,
                    }),
                );
                return;
            }
            onScheduleEmailingManagementEdit(scheduledEmail);
        },
        [
            onScheduleEmailingManagementEdit,
            enableAutomationManagement,
            dashboardId,
            workspace,
            isEmbedded,
            useHostRoute,
            externalRecipientOverride,
        ],
    );

    // Filter computation — moved verbatim from ScheduledEmailDialogProvider
    const automationDefaultSelectedFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const { executionFilters: savedWidgetFilters } = getAutomationVisualizationFilters(scheduledExportToEdit);
    const savedDashboardFilters = getAutomationDashboardFilters(scheduledExportToEdit);
    const {
        result: liveWidgetFilters,
        status: widgetFiltersStatus,
        error: widgetFiltersError,
    } = useWidgetAutomationFilters(widget, insight);

    const widgetFilters = savedWidgetFilters ?? liveWidgetFilters;
    const shouldLoadWidgetFilters = !!widget && !savedWidgetFilters;

    const dashboardFilters =
        savedDashboardFilters ??
        getAppliedDashboardFilters(automationDefaultSelectedFilters, dashboardHiddenFilters, true);

    const isLoading =
        automationsLoading ||
        (shouldLoadWidgetFilters && (widgetFiltersStatus === "pending" || widgetFiltersStatus === "running"));
    const loadingError = (shouldLoadWidgetFilters ? widgetFiltersError : undefined) ?? automationsError;

    const insightWidget = isWidget(widget) ? widget : undefined;

    const seCtx = useBuildScheduledEmailDialogContext({
        widget: insightWidget,
        insight,
    });

    const managementCtx = useBuildScheduledEmailManagementDialogContext();

    return (
        <ScheduledEmailDialogContextProvider value={seCtx}>
            <ScheduledEmailManagementDialogContextProvider value={managementCtx}>
                {isScheduleEmailingManagementDialogOpen ? (
                    // TODO(GDP-3167 phase3): automations, notificationChannels, and scheduleDataError
                    // are still prop-threaded here because DefaultScheduledEmailManagementDialog reads
                    // them from props, not from AutomationsContext. Once all dialog fields are migrated
                    // to read from context, remove these props and the corresponding prop types.
                    <ScheduledEmailManagementDialog
                        automations={automations}
                        notificationChannels={notificationChannels}
                        scheduleDataError={loadingError}
                        isLoadingScheduleData={isLoading}
                        onAdd={onScheduleEmailingManagementAdd}
                        onEdit={handleManagementEdit}
                        onClose={onScheduleEmailingManagementClose}
                        onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                        onDeleteError={onScheduleEmailingManagementDeleteError}
                    />
                ) : null}
            </ScheduledEmailManagementDialogContextProvider>
            {isScheduleEmailingDialogOpen ? (
                // TODO(GDP-3167 phase3): notificationChannels, users, usersError, widgetFilters,
                // dashboardFilters, and isLoading are still prop-threaded here because
                // DefaultScheduledEmailDialog reads them from props, not from context.
                // Once all dialog fields are migrated to read from context, remove these props
                // and the corresponding prop types.
                <ScheduledEmailDialogWithUsers
                    scheduledExportToEdit={scheduledExportToEdit}
                    notificationChannels={notificationChannels}
                    widget={insightWidget}
                    insight={insight}
                    widgetFilters={widgetFilters}
                    dashboardFilters={dashboardFilters}
                    isLoading={isLoading}
                    onBack={onScheduleEmailingBack}
                    onCancel={onScheduleEmailingCancel}
                    onError={onScheduleEmailingCreateError}
                    onSuccess={onScheduleEmailingCreateSuccess}
                    onSaveError={onScheduleEmailingSaveError}
                    onSaveSuccess={onScheduleEmailingSaveSuccess}
                    onDeleteSuccess={onScheduleEmailingManagementDeleteSuccess}
                    onDeleteError={onScheduleEmailingManagementDeleteError}
                />
            ) : null}
        </ScheduledEmailDialogContextProvider>
    );
}

/**
 * Loads workspace users only while the create/edit dialog is mounted. Keeping the
 * `useWorkspaceUsers()` call in this child (rather than in ScheduledEmailConnectorWithData)
 * means that opening only the management dialog — which does not consume users — never
 * dispatches the workspace-users load, matching the pre-separation behavior.
 */
function ScheduledEmailDialogWithUsers(
    props: Omit<IScheduledEmailDialogProps, "users" | "usersError">,
): ReactElement {
    const { users, status: usersStatus, usersError } = useWorkspaceUsers();

    return (
        <ScheduledEmailDialog
            {...props}
            users={users ?? []}
            usersError={usersError}
            isLoading={props.isLoading || usersStatus === "pending" || usersStatus === "loading"}
        />
    );
}
