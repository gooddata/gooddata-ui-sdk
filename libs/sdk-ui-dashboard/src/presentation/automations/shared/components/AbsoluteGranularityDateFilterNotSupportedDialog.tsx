// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import {
    ConfirmDialogBase,
    Overlay,
    OverlayController,
    OverlayControllerProvider,
    useId,
} from "@gooddata/sdk-ui-kit";

import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../../constants/zIndex.js";

const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

interface IAbsoluteGranularityDateFilterNotSupportedDialogProps {
    automationType: "alert" | "scheduledExport";
    onCancel?: () => void;
}

/**
 * Shown in place of the automation dialog while automations do not support the absolute date filter
 * with granularity.
 *
 * @internal
 */
export function AbsoluteGranularityDateFilterNotSupportedDialog({
    automationType,
    onCancel,
}: IAbsoluteGranularityDateFilterNotSupportedDialogProps) {
    const intl = useIntl();
    const titleElementId = useId();

    return (
        <Overlay className="gd-notifications-channels-dialog-overlay" isModal positionType="fixed">
            <OverlayControllerProvider overlayController={overlayController}>
                <ConfirmDialogBase
                    className="gd-notifications-channels-dialog s-absolute-granularity-date-filter-not-supported-dialog"
                    headline={
                        automationType === "alert"
                            ? intl.formatMessage({
                                  id: "dialogs.automation.absoluteGranularityDateFilter.alert.title",
                              })
                            : intl.formatMessage({
                                  id: "dialogs.automation.absoluteGranularityDateFilter.scheduledExport.title",
                              })
                    }
                    cancelButtonText={intl.formatMessage({ id: "close" })}
                    onCancel={onCancel}
                    accessibilityConfig={{ titleElementId }}
                >
                    <div className="gd-notifications-channel-dialog-content-wrapper">
                        {automationType === "alert"
                            ? intl.formatMessage({
                                  id: "dialogs.automation.absoluteGranularityDateFilter.alert.description",
                              })
                            : intl.formatMessage({
                                  id: "dialogs.automation.absoluteGranularityDateFilter.scheduledExport.description",
                              })}
                    </div>
                </ConfirmDialogBase>
            </OverlayControllerProvider>
        </Overlay>
    );
}
