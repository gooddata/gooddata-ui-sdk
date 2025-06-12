// (C) 2019-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import {
    ConfirmDialogBase,
    Overlay,
    OverlayControllerProvider,
    OverlayController,
    UiSkeleton,
    useId,
} from "@gooddata/sdk-ui-kit";
import { IAlertingDialogProps } from "../types.js";
import { DASHBOARD_DIALOG_OVERS_Z_INDEX } from "../../constants/index.js";
const overlayController = OverlayController.getInstance(DASHBOARD_DIALOG_OVERS_Z_INDEX);

export function DefaultLoadingAlertingDialog({
    alertToEdit,
    onCancel,
}: Pick<IAlertingDialogProps, "onCancel" | "alertToEdit">) {
    const intl = useIntl();
    const titleElementId = useId();

    return (
        <>
            <Overlay className="gd-notifications-channels-dialog-overlay" isModal={true} positionType="fixed">
                <OverlayControllerProvider overlayController={overlayController}>
                    <ConfirmDialogBase
                        className="gd-notifications-channels-dialog s-gd-notifications-channels-dialog"
                        isPositive={true}
                        cancelButtonText={intl.formatMessage({ id: "cancel" })}
                        submitButtonText={
                            alertToEdit
                                ? intl.formatMessage({ id: `save` })
                                : intl.formatMessage({ id: `create` })
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
                        accessibilityConfig={{ titleElementId }}
                    >
                        <h2 className={"sr-only"} id={titleElementId}>
                            {intl.formatMessage({ id: "dialogs.alert.accessibility.label.title" })}
                        </h2>
                        <div className="gd-notifications-channel-dialog-content-wrapper">
                            <div className="gd-divider-with-margin" />
                            <UiSkeleton itemHeight={50} itemsCount={3} />
                        </div>
                    </ConfirmDialogBase>
                </OverlayControllerProvider>
            </Overlay>
        </>
    );
}
