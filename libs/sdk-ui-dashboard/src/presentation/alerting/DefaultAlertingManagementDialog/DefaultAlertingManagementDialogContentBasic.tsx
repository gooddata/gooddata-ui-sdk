// (C) 2022-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage, defineMessage, useIntl } from "react-intl";

import { type IAutomationMetadataObject } from "@gooddata/sdk-model";
import {
    Button,
    Dialog,
    Hyperlink,
    OverlayController,
    OverlayControllerProvider,
    Typography,
    useId,
} from "@gooddata/sdk-ui-kit";

import { Alerts } from "./components/AlertsList.js";
import { messages } from "../../../locales.js";
import { useDashboardSelector } from "../../../model/react/DashboardStoreProvider.js";
import { selectIsWhiteLabeled } from "../../../model/store/config/configSelectors.js";
import { selectIsAlertingDialogOpen } from "../../../model/store/ui/uiSelectors.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/zIndex.js";
import { isMobileView } from "../DefaultAlertingDialog/utils/responsive.js";
import { useAlertingDialogAccessibility } from "../hooks/useAlertingDialogAccessibility.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IDefaultAlertingManagementDialogContentBasicProps {
    onClose?: () => void;
    onDelete: (alert: IAutomationMetadataObject) => void;
    onEdit: (alert: IAutomationMetadataObject) => void;
    onPause: (alert: IAutomationMetadataObject, pause: boolean) => void;
    isLoadingAlertingData: boolean;
    automations: IAutomationMetadataObject[];
}

/**
 * @internal
 */
export function DefaultAlertingManagementDialogContentBasic({
    onClose,
    onDelete,
    onEdit,
    onPause,
    isLoadingAlertingData,
    automations,
}: IDefaultAlertingManagementDialogContentBasicProps) {
    const intl = useIntl();
    const isWhiteLabeled = useDashboardSelector(selectIsWhiteLabeled);
    const isEditDialogOpen = useDashboardSelector(selectIsAlertingDialogOpen);
    const { returnFocusTo } = useAlertingDialogAccessibility();

    const isMobile = isMobileView();

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
            className={cx("gd-notifications-channels-management-dialog s-alerting-management-dialog")}
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
                <div className="gd-notifications-channels-content">
                    <div className="gd-notifications-channels-content-header">
                        <Typography tagName="h3">
                            <FormattedMessage id={messages.alertingManagementListTitle.id} />
                        </Typography>
                    </div>
                    <Alerts
                        onDelete={onDelete}
                        onEdit={onEdit}
                        onPause={onPause}
                        isLoading={isLoadingAlertingData}
                        alerts={automations}
                        noAlertsMessageId={messages.alertingManagementNoAlerts.id}
                    />
                </div>
                <div className="gd-content-divider"></div>
                <div className={`gd-buttons${isWhiteLabeled ? " gd-buttons--end" : ""}`}>
                    {isWhiteLabeled ? null : (
                        <Hyperlink
                            text={intl.formatMessage({ id: helpTextId })}
                            href="https://www.gooddata.com/docs/cloud/create-dashboards/automation/alerts/"
                            iconClass="gd-icon-circle-question"
                        />
                    )}
                    <div className="gd-buttons">
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
