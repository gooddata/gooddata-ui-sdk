// (C) 2026 GoodData Corporation

import { type ReactElement, type ReactNode, useMemo } from "react";

import {
    type FilterContextItem,
    type IAutomationMetadataObject,
    type IInsight,
    type INotificationChannelIdentifier,
    type INotificationChannelMetadataObject,
    type IWidget,
    isWidget,
} from "@gooddata/sdk-model";

import {
    getAutomationDashboardFilters,
    getAutomationVisualizationFilters,
} from "../../../_staging/automation/index.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { useDashboardScheduledEmails } from "../../../model/react/useDasboardScheduledEmails/useDashboardScheduledEmails.js";
import {
    selectAutomationDefaultSelectedFilters,
    selectDashboardHiddenFilters,
} from "../../../model/store/filtering/dashboardFilterSelectors.js";
import { useDashboardComponentsContext } from "../../dashboardContexts/DashboardComponentsContext.js";
import { AutomationsContextProvider } from "../contexts/AutomationsContext.js";
import { ScheduledEmailDialogContextProvider } from "../contexts/ScheduledEmailDialogContext.js";
import { ScheduledEmailManagementDialogContextProvider } from "../contexts/ScheduledEmailManagementDialogContext.js";
import { ScheduledEmailDialog } from "../scheduledEmail/ScheduledEmailDialog.js";
import { ScheduledEmailManagementDialog } from "../scheduledEmail/ScheduledEmailManagementDialog.js";
import { getAppliedDashboardFilters } from "../shared/filters/index.js";
import { type IAutomationDialogCallbacks } from "../shared/types.js";

import { useAutomationManagementEditRouting } from "./hooks/useAutomationManagementEditRouting.js";
import { useBuildAutomationsContext } from "./hooks/useBuildAutomationsContext.js";
import { useBuildScheduledEmailDialogContext } from "./hooks/useBuildScheduledEmailDialogContext.js";
import { useBuildScheduledEmailManagementDialogContext } from "./hooks/useBuildScheduledEmailManagementDialogContext.js";
import { useWidgetAutomationFilters } from "./hooks/useWidgetAutomationFilters.js";

type ScheduledEmailsProps = ReturnType<typeof useDashboardScheduledEmails>;

/**
 * Provides AutomationsContext to its children, built from dashboard Redux state, with the
 * resolved context decorator mounted directly inside — so everything in the scheduled-email dialog
 * subtree (both the create/edit and management dialogs) reads the decorated value.
 *
 * @internal
 */
export function ScheduledEmailAutomationsProvider({ children }: { children: ReactNode }): ReactElement {
    const automationsCtx = useBuildAutomationsContext();
    const { AutomationsContextDecoratorComponent } = useDashboardComponentsContext();
    return (
        <AutomationsContextProvider value={automationsCtx}>
            <AutomationsContextDecoratorComponent>{children}</AutomationsContextDecoratorComponent>
        </AutomationsContextProvider>
    );
}

/**
 * Connector component that reads from the dashboard Redux store and wires up
 * the scheduled-email dialog tree (create/edit and management) via context providers.
 *
 * This is the bridge between dashboard store state and the scheduled-email dialog tree, with no
 * exceptions: the shared `automationFilters` hooks (`useAutomationFiltersSelect`,
 * `useAutomationExportParameters`, `useValidateExistingAutomationFilters`) read AutomationsContext and
 * take their widget-scoped values as props from this connector's `ScheduledEmailDialogContext`.
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

    // Defer store reads until at least one dialog is open.
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
        automationsLoading,
        notificationChannels,
        // Single Schedule Dialog
        isScheduleEmailingDialogOpen,
        onScheduleEmailingCancel,
        onScheduleEmailingBack,
        onScheduleEmailingCreateSuccess,
        onScheduleEmailingCreateError,
        onScheduleEmailingUpdateSuccess,
        onScheduleEmailingUpdateError,
        // Management / List Dialog
        isScheduleEmailingManagementDialogOpen,
        onScheduleEmailingManagementClose,
        onScheduleEmailingManagementAdd,
        onScheduleEmailingManagementEdit,
        onScheduleEmailingDeleteSuccess,
        onScheduleEmailingDeleteError,
        widget,
        insight,
    } = se;

    const handleManagementEdit = useAutomationManagementEditRouting(onScheduleEmailingManagementEdit);

    // Filter computation — moved verbatim from ScheduledEmailDialogProvider
    const automationDefaultSelectedFilters = useDashboardSelector(selectAutomationDefaultSelectedFilters);
    const dashboardHiddenFilters = useDashboardSelector(selectDashboardHiddenFilters);
    const { executionFilters: savedWidgetFilters } = getAutomationVisualizationFilters(scheduledExportToEdit);
    const { status: widgetFiltersStatus } = useWidgetAutomationFilters(widget, insight);

    const shouldLoadWidgetFilters = !!widget && !savedWidgetFilters;

    const dashboardFilters = useMemo(
        () =>
            getAutomationDashboardFilters(scheduledExportToEdit) ??
            getAppliedDashboardFilters(automationDefaultSelectedFilters, dashboardHiddenFilters, true),
        [scheduledExportToEdit, automationDefaultSelectedFilters, dashboardHiddenFilters],
    );

    const isLoading =
        automationsLoading ||
        (shouldLoadWidgetFilters && (widgetFiltersStatus === "pending" || widgetFiltersStatus === "running"));

    const insightWidget = isWidget(widget) ? widget : undefined;

    const managementCtx = useBuildScheduledEmailManagementDialogContext({ automations, isLoading });

    return (
        <ScheduledEmailManagementDialogContextProvider value={managementCtx}>
            {isScheduleEmailingManagementDialogOpen ? (
                <ScheduledEmailManagementDialog
                    onAdd={onScheduleEmailingManagementAdd}
                    onEdit={handleManagementEdit}
                    onClose={onScheduleEmailingManagementClose}
                />
            ) : null}
            {isScheduleEmailingDialogOpen ? (
                <ScheduledEmailCreateEditConnector
                    scheduledExportToEdit={scheduledExportToEdit}
                    notificationChannels={notificationChannels}
                    widget={insightWidget}
                    insight={insight}
                    dashboardFilters={dashboardFilters}
                    isLoading={isLoading}
                    onBack={onScheduleEmailingBack}
                    onCancel={onScheduleEmailingCancel}
                    onCreateError={onScheduleEmailingCreateError}
                    onCreateSuccess={onScheduleEmailingCreateSuccess}
                    onUpdateError={onScheduleEmailingUpdateError}
                    onUpdateSuccess={onScheduleEmailingUpdateSuccess}
                    onDeleteSuccess={onScheduleEmailingDeleteSuccess}
                    onDeleteError={onScheduleEmailingDeleteError}
                />
            ) : null}
        </ScheduledEmailManagementDialogContextProvider>
    );
}

/**
 * Data and callbacks `ScheduledEmailCreateEditConnector` needs. These are the connector's own props, not
 * `IScheduledEmailDialogProps` members: the data fields feed `useBuildScheduledEmailDialogContext` (the
 * dialog itself now reads them from `ScheduledEmailDialogContext`), and the callbacks are forwarded to
 * `ScheduledEmailDialog` unchanged.
 */
interface IScheduledEmailCreateEditConnectorProps extends IAutomationDialogCallbacks {
    scheduledExportToEdit?: IAutomationMetadataObject;
    notificationChannels: INotificationChannelIdentifier[] | INotificationChannelMetadataObject[];
    widget?: IWidget;
    insight?: IInsight;
    dashboardFilters?: FilterContextItem[];
    isLoading: boolean;
    onBack?: () => void;
}

/**
 * Hydrates the scheduled-email create/edit context. Lives here rather than in the parent so that
 * opening only the management dialog — which does not consume it — skips the work.
 */
function ScheduledEmailCreateEditConnector(props: IScheduledEmailCreateEditConnectorProps): ReactElement {
    const {
        scheduledExportToEdit,
        notificationChannels,
        widget,
        insight,
        dashboardFilters,
        isLoading,
        onBack,
        onCancel,
        onCreateError,
        onCreateSuccess,
        onUpdateError,
        onUpdateSuccess,
        onDeleteSuccess,
        onDeleteError,
    } = props;

    const seCtx = useBuildScheduledEmailDialogContext({
        widget,
        insight,
        scheduledExportToEdit,
        notificationChannels,
        dashboardFilters,
        isLoading,
    });

    return (
        <ScheduledEmailDialogContextProvider value={seCtx}>
            <ScheduledEmailDialog
                onBack={onBack}
                onCancel={onCancel}
                onCreateError={onCreateError}
                onCreateSuccess={onCreateSuccess}
                onUpdateError={onUpdateError}
                onUpdateSuccess={onUpdateSuccess}
                onDeleteSuccess={onDeleteSuccess}
                onDeleteError={onDeleteError}
            />
        </ScheduledEmailDialogContextProvider>
    );
}
