// (C) 2022-2025 GoodData Corporation
import React, { useState } from "react";

import { FormattedMessage } from "react-intl";

import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, Button, Icon, OverlayPositionType } from "@gooddata/sdk-ui-kit";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";

import { AlertTriggerModeSelect } from "../../../../alerting/DefaultAlertingDialog/components/AlertTriggerModeSelect.js";
import { gdColorStateBlank } from "../../../../constants/index.js";

const TOOLTIP_ALIGN_POINTS = [
    { align: "cr cl", offset: { x: 0, y: -1 } },
    { align: "cl cr", offset: { x: 0, y: -1 } },
];

interface IEditAlertConfigurationProps {
    alert: IAutomationMetadataObject;
    onCancel: () => void;
    onUpdate: (alert: IAutomationMetadataObject) => void;
    overlayPositionType?: OverlayPositionType;
}

export function EditAlertConfiguration({
    alert,
    onCancel,
    onUpdate,
    overlayPositionType,
}: IEditAlertConfigurationProps) {
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);
    const canSubmit = updatedAlert.alert?.trigger.mode !== alert.alert?.trigger.mode;
    const theme = useTheme();

    const accessibilityValue = "alert.configuration.trigger";

    return (
        <div className="gd-edit-alert-configuration">
            <div className="gd-edit-alert-configuration__form">
                <label htmlFor={accessibilityValue} className="gd-edit-alert-configuration__trigger-label">
                    <FormattedMessage id="insightAlert.config.trigger" />
                    <BubbleHoverTrigger>
                        <Icon.QuestionMark
                            className="gd-edit-alert-configuration__trigger-label-icon"
                            color={theme?.palette?.complementary?.c6 ?? gdColorStateBlank}
                            width={14}
                            height={14}
                        />
                        <Bubble alignPoints={TOOLTIP_ALIGN_POINTS}>
                            <FormattedMessage id="insightAlert.config.trigger.tooltip" />
                        </Bubble>
                    </BubbleHoverTrigger>
                </label>
                <div className="gd-edit-alert-configuration__trigger-select">
                    <AlertTriggerModeSelect
                        id={accessibilityValue}
                        selectedTriggerMode={updatedAlert.alert?.trigger.mode ?? "ALWAYS"}
                        onTriggerModeChange={(triggerMode) => {
                            setUpdatedAlert({
                                ...updatedAlert,
                                alert: {
                                    ...updatedAlert.alert!,
                                    trigger: {
                                        ...updatedAlert.alert!.trigger,
                                        mode: triggerMode,
                                    },
                                },
                            });
                        }}
                        overlayPositionType={overlayPositionType}
                    />
                </div>
            </div>
            <div className="gd-edit-alert-configuration__buttons">
                <div>
                    <Button
                        variant="secondary"
                        size="small"
                        onClick={() => {
                            onCancel();
                        }}
                    >
                        <FormattedMessage id="cancel" />
                    </Button>
                    <Button
                        intent="action"
                        size="small"
                        disabled={!canSubmit}
                        onClick={() => onUpdate(updatedAlert)}
                    >
                        <FormattedMessage id="save" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
