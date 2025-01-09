// (C) 2019-2024 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import {
    ConfirmDialogBase,
    Overlay,
    ContentDivider,
    OverlayControllerProvider,
    OverlayController,
    UiSkeleton,
} from "@gooddata/sdk-ui-kit";
import { IScheduledEmailDialogProps } from "../types.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function DefaultLoadingScheduledEmailDialog({
    scheduledExportToEdit,
    onCancel,
}: Pick<IScheduledEmailDialogProps, "onCancel" | "scheduledExportToEdit">) {
    const intl = useIntl();

    return (
        <>
            <Overlay className="gd-notifications-channels-dialog-overlay" isModal={true} positionType="fixed">
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialogBase
                        className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog"
                        isPositive={true}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                        submitButtonText={
                            scheduledExportToEdit
                                ? intl.formatMessage({ id: `dialogs.schedule.email.save` })
                                : intl.formatMessage({ id: `dialogs.schedule.email.create` })
                        }
                        footerLeftRenderer={() => (
                            <div className="gd-notifications-channels-dialog-footer-link">
                                <UiSkeleton itemHeight={32} itemWidth={100} />
                            </div>
                        )}
                        isSubmitDisabled
                        submitOnEnterKey={false}
                        onCancel={onCancel}
                        headline={undefined}
                        headerLeftButtonRenderer={() => (
                            <div className="gd-notifications-channels-dialog-header">
                                <UiSkeleton
                                    itemHeight={29}
                                    itemWidth={[29, "100%"]}
                                    itemsCount={2}
                                    direction="row"
                                />
                            </div>
                        )}
                    >
                        <div className="gd-notifications-channel-dialog-content-wrapper">
                            <ContentDivider className="gd-divider-with-margin gd-divider-full-row" />
                            <UiSkeleton itemHeight={50} itemsCount={3} />
                        </div>
                    </ConfirmDialogBase>
                </OverlayControllerProvider>
            </Overlay>
        </>
    );
}
