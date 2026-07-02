// (C) 2022-2026 GoodData Corporation

import { useCallback, useMemo } from "react";

import cx from "classnames";
import { defineMessage, useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import { type IDashboardUrlBuilder, buildDashboardUrl, useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { Automations, type AutomationsAvailableFilters } from "@gooddata/sdk-ui-ext";
import {
    Button,
    ContentDivider,
    Dialog,
    Hyperlink,
    type IButtonAccessibilityConfig,
    OverlayController,
    OverlayControllerProvider,
    Typography,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../locales.js";
import { AUTOMATIONS_COLUMN_CONFIG, AUTOMATIONS_MAX_HEIGHT } from "../../../constants/automations.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";
import { useAutomationsContext } from "../../contexts/AutomationsContext.js";
import { useScheduledEmailManagementDialogContext } from "../../contexts/ScheduledEmailManagementDialogContext.js";
import { computeUseHostRoute } from "../../shared/utils/automationUtils.js";
import { SCHEDULED_EMAIL_DIALOG_ID } from "../DefaultScheduledEmailDialog/constants.js";
import { useScheduleEmailDialogAccessibility } from "../hooks/useScheduleEmailDialogAccessibility.js";
import { isMobileView } from "../utils/responsive.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IDefaultScheduledEmailManagementDialogContentProps {
    onAdd?: () => void;
    onClose?: () => void;
    onEdit: (scheduledEmail: IAutomationMetadataObject) => void;
    isLoadingScheduleData: boolean;
    automations: IAutomationMetadataObject[];
}

export function DefaultScheduledEmailManagementDialogContent({
    onAdd,
    onClose,
    onEdit,
    isLoadingScheduleData,
    automations,
}: IDefaultScheduledEmailManagementDialogContentProps) {
    const intl = useIntl();
    const isMobile = isMobileView();
    const workspace = useWorkspace();
    const backend = useBackend();

    const {
        timezone,
        locale,
        settings,
        isWhiteLabeled,
        isExecutionTimestampMode,
        externalRecipient: externalRecipientOverride,
        features: { canCreateAutomation },
    } = useAutomationsContext();
    const {
        dashboardId,
        dashboardTitle,
        enableAccessibilityMode,
        isScheduleEmailDialogOpen: isEditDialogOpen,
        automationsInvalidationId,
        isEmbedded,
        maxAutomations,
        unlimitedAutomations,
    } = useScheduledEmailManagementDialogContext();

    const enableBulkActions = !enableAccessibilityMode;
    const useHostRoute = computeUseHostRoute(settings);
    const { returnFocusTo } = useScheduleEmailDialogAccessibility();

    const maxAutomationsReached = automations.length >= maxAutomations && !unlimitedAutomations;

    const isAddButtonDisabled = useMemo(
        () => isLoadingScheduleData || maxAutomationsReached || isExecutionTimestampMode,
        [isLoadingScheduleData, maxAutomationsReached, isExecutionTimestampMode],
    );

    const availableFilters = externalRecipientOverride
        ? (["dashboard", "status"] as AutomationsAvailableFilters)
        : undefined;

    const helpTextId = isMobile
        ? defineMessage({ id: "dialogs.schedule.email.footer.title.short" }).id
        : defineMessage({ id: "dialogs.schedule.email.footer.title" }).id;

    const dashboardUrlBuilder: IDashboardUrlBuilder = useCallback(
        ({ workspaceId, dashboardId, tabId }) =>
            buildDashboardUrl({
                workspaceId,
                dashboardId,
                tabId,
                isEmbedded,
                useHostRoute,
                queryParams: externalRecipientOverride ? { recipient: externalRecipientOverride } : undefined,
            }),
        [isEmbedded, useHostRoute, externalRecipientOverride],
    );

    const titleElementId = useId();

    return (
        <Dialog
            displayCloseButton
            autofocusOnOpen
            onCancel={onClose}
            className={cx(
                "gd-notifications-channels-management-dialog s-scheduled-email-management-dialog",
                "gd-dialog--wide gd-notifications-channels-management-dialog--wide",
                "gd-dialog--no-padding",
            )}
            accessibilityConfig={{ titleElementId, isModal: true }}
            returnFocusAfterClose
            returnFocusTo={returnFocusTo}
            refocusKey={isEditDialogOpen}
        >
            <OverlayControllerProvider overlayController={overlayController}>
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header" id={titleElementId}>
                        {intl.formatMessage({ id: "dialogs.schedule.management.title" })}
                    </Typography>
                </div>
                <ContentDivider className="gd-content-divider--no-spacing" />
                <div className="gd-notifications-channels-content">
                    <Automations
                        workspace={workspace}
                        timezone={timezone}
                        type="schedule"
                        backend={backend}
                        scope="workspace"
                        maxHeight={AUTOMATIONS_MAX_HEIGHT}
                        isMobileView={isMobile}
                        tableVariant="small"
                        editAutomation={onEdit}
                        preselectedFilters={{
                            dashboard: dashboardId
                                ? [{ value: dashboardId, label: dashboardTitle }]
                                : undefined,
                            externalRecipients: externalRecipientOverride
                                ? [{ value: externalRecipientOverride }]
                                : undefined,
                        }}
                        enableBulkActions={enableBulkActions}
                        availableFilters={availableFilters}
                        locale={locale}
                        externalInvalidationId={automationsInvalidationId}
                        renderToolbarCustomElement={() =>
                            canCreateAutomation ? (
                                <CreateButton
                                    onClick={onAdd}
                                    isDisabled={isAddButtonDisabled}
                                    label={intl.formatMessage({
                                        id: messages.scheduleManagementCreateNew.id,
                                    })}
                                    tooltipContent={
                                        maxAutomationsReached
                                            ? intl.formatMessage({
                                                  id: messages.scheduleManagementCreateTooMany.id,
                                              })
                                            : isExecutionTimestampMode
                                              ? intl.formatMessage({
                                                    id: messages.scheduleManagementExecutionTimestampMode.id,
                                                })
                                              : undefined
                                    }
                                    isTooltipDisabled={!maxAutomationsReached && !isExecutionTimestampMode}
                                    accessibilityConfig={{
                                        ariaHaspopup: "dialog",
                                        ariaControls: SCHEDULED_EMAIL_DIALOG_ID,
                                    }}
                                />
                            ) : null
                        }
                        selectedColumnDefinitions={AUTOMATIONS_COLUMN_CONFIG}
                        dashboardUrlBuilder={dashboardUrlBuilder}
                    />
                </div>
                <ContentDivider className="gd-content-divider--no-spacing" />
                <div className={`gd-buttons${isWhiteLabeled ? " gd-buttons--end" : ""}`}>
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/scheduled-exports/#ScheduleExportsinDashboards-ScheduleExport"
                            iconClass="gd-icon-circle-question"
                        />
                    )}
                    <div className="gd-buttons-inner">
                        <Button
                            onClick={onClose}
                            className="gd-button-secondary s-close-button"
                            value={intl.formatMessage({ id: "close" })}
                        />
                    </div>
                </div>
            </OverlayControllerProvider>
        </Dialog>
    );
}

interface ICreateButtonProps {
    onClick?: () => void;
    isDisabled: boolean;
    label: string;
    tooltipContent: string | undefined;
    isTooltipDisabled: boolean;
    accessibilityConfig?: IButtonAccessibilityConfig;
}

function CreateButton({
    onClick,
    isDisabled,
    label,
    tooltipContent,
    isTooltipDisabled,
    accessibilityConfig,
}: ICreateButtonProps) {
    return (
        <UiTooltip
            optimalPlacement
            anchor={
                <Button
                    onClick={onClick}
                    disabled={isDisabled}
                    value={label}
                    size="small"
                    className="gd-button-action"
                    accessibilityConfig={accessibilityConfig}
                />
            }
            disabled={isTooltipDisabled}
            triggerBy={["hover"]}
            content={tooltipContent}
        />
    );
}
