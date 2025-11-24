// (C) 2022-2025 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { useBackend, useWorkspace } from "@gooddata/sdk-ui";
import { Automations, AutomationsAvailableFilters } from "@gooddata/sdk-ui-ext";
import {
    Button,
    ContentDivider,
    Dialog,
    Hyperlink,
    OverlayController,
    OverlayControllerProvider,
    Typography,
    UiTooltip,
    useId,
} from "@gooddata/sdk-ui-kit";

import { messages } from "../../../locales.js";
import {
    selectCanCreateAutomation,
    selectDashboardId,
    selectDashboardTitle,
    selectEnableAccessibilityMode,
    selectExternalRecipient,
    selectInsightByWidgetRef,
    selectIsAlertingDialogOpen,
    selectIsAlertingManagementDialogContext,
    selectIsWhiteLabeled,
    selectTimezone,
    selectWidgetByRef,
    useAutomationsInvalidateRef,
    useDashboardSelector,
} from "../../../model/index.js";
import {
    AUTOMATIONS_COLUMN_CONFIG,
    AUTOMATIONS_MAX_HEIGHT,
    DASHBOARD_DIALOG_OVERS_Z_INDEX,
} from "../../../presentation/constants/index.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { useAlertingDialogAccessibility } from "../hooks/useAlertingDialogAccessibility.js";
import { useGetSupportedMeasures } from "../hooks/useGetSupportedMeasures.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IDefaultAlertingManagementDialogContentEnhancedProps {
    onAdd?: () => void;
    onClose?: () => void;
    onEdit: (alert: IAutomationMetadataObject) => void;
}

/**
 * @internal
 */
export function DefaultAlertingManagementDialogContentEnhanced({
    onAdd,
    onClose,
    onEdit,
}: IDefaultAlertingManagementDialogContentEnhancedProps) {
    const intl = useIntl();
    const workspace = useWorkspace();
    const backend = useBackend();
    const timezone = useDashboardSelector(selectTimezone);
    const canCreateAutomation = useDashboardSelector(selectCanCreateAutomation);
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const isEditDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen);
    const managementDialogContext = useDashboardSelector(selectIsAlertingManagementDialogContext);
    const enableBulkActions = !useDashboardSelector(selectEnableAccessibilityMode);
    const dashboardId = useDashboardSelector(selectDashboardId);
    const dashboardTitle = useDashboardSelector(selectDashboardTitle);
    const externalRecipientOverride = useDashboardSelector(selectExternalRecipient);
    const { returnFocusTo } = useAlertingDialogAccessibility();

    const invalidateItemsRef = useAutomationsInvalidateRef();
    const isMobile = isMobileView();

    // Check if widget has metrics for alert creation
    const widget = useDashboardSelector(selectWidgetByRef(managementDialogContext.widgetRef));
    const insight = useDashboardSelector(selectInsightByWidgetRef(widget?.ref));
    const supportedMeasures = useGetSupportedMeasures(
        managementDialogContext.widgetRef ? insight : undefined,
    );
    const hasMetrics = supportedMeasures.length > 0;

    const availableFilters = externalRecipientOverride
        ? (["dashboard", "status"] as AutomationsAvailableFilters)
        : undefined;

    const helpTextId = isMobile
        ? defineMessage({ id: "dialogs.alerting.footer.title.short" }).id
        : defineMessage({ id: "dialogs.alerting.footer.title" }).id;

    const titleElementId = useId();

    return (
        <Dialog
            displayCloseButton
            onCancel={onClose}
            shouldCloseOnClick={() => false}
            autofocusOnOpen
            className={cx(
                "gd-notifications-channels-management-dialog s-alerting-management-dialog",
                "gd-dialog--wide gd-notifications-channels-management-dialog--wide",
                "gd-dialog--no-padding",
            )}
            accessibilityConfig={{ titleElementId, isModal: true }}
            returnFocusTo={returnFocusTo}
            returnFocusAfterClose
            refocusKey={isEditDialogOpen}
        >
            <OverlayControllerProvider overlayController={overlayController}>
                <div className="gd-notifications-channels-management-dialog-title">
                    <Typography tagName="h3" className="gd-dialog-header" id={titleElementId}>
                        <FormattedMessage id="dialogs.alerting.management.title" />
                    </Typography>
                </div>
                <ContentDivider className="gd-content-divider--no-spacing" />
                <div className="gd-notifications-channels-content">
                    <Automations
                        workspace={workspace}
                        timezone={timezone}
                        backend={backend}
                        scope="workspace"
                        type="alert"
                        maxHeight={AUTOMATIONS_MAX_HEIGHT}
                        isMobileView={isMobile}
                        tableVariant="small"
                        editAutomation={onEdit}
                        preselectedFilters={{
                            dashboard: dashboardId
                                ? [{ value: dashboardId, label: dashboardTitle! }]
                                : undefined,
                            externalRecipients: externalRecipientOverride
                                ? [{ value: externalRecipientOverride }]
                                : undefined,
                        }}
                        enableBulkActions={enableBulkActions}
                        availableFilters={availableFilters}
                        locale={intl.locale}
                        invalidateItemsRef={invalidateItemsRef}
                        renderToolbarCustomElement={() =>
                            managementDialogContext.widgetRef && canCreateAutomation ? (
                                <CreateButton
                                    onClick={onAdd}
                                    hasMetrics={hasMetrics}
                                    label={intl.formatMessage({
                                        id: messages.alertingManagementCreateNew.id!,
                                    })}
                                    tooltipContent={intl.formatMessage({
                                        id: messages.alertingCreateNoMeasureTooltip.id!,
                                    })}
                                />
                            ) : null
                        }
                        selectedColumnDefinitions={AUTOMATIONS_COLUMN_CONFIG}
                    />
                </div>
                <ContentDivider className="gd-content-divider--no-spacing" />
                <div className={`gd-buttons${isWhiteLabeled ? " gd-buttons--end" : ""}`}>
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
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
    hasMetrics: boolean;
    label: string;
    tooltipContent: string;
}

function CreateButton({ onClick, hasMetrics, label, tooltipContent }: ICreateButtonProps) {
    return (
        <UiTooltip
            optimalPlacement
            anchor={
                <Button
                    onClick={onClick}
                    size="small"
                    className="gd-button-action s-add-alert-button"
                    value={label}
                    disabled={!hasMetrics}
                />
            }
            disabled={hasMetrics}
            triggerBy={["hover"]}
            content={tooltipContent}
        />
    );
}
