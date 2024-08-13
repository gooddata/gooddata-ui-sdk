// (C) 2022-2024 GoodData Corporation
import React, { useState } from "react";
import { IAutomationMetadataObject } from "@gooddata/sdk-model";
import { Button, Icon } from "@gooddata/sdk-ui-kit";
import { AlertTriggerModeSelect } from "./AlertTriggerModeSelect.js";

interface IEditAlertConfigurationProps {
    alert: IAutomationMetadataObject;
    onCancel: () => void;
    onUpdate: (alert: IAutomationMetadataObject) => void;
}

export const EditAlertConfiguration: React.FC<IEditAlertConfigurationProps> = ({
    alert,
    onCancel,
    onUpdate,
}) => {
    const [updatedAlert, setUpdatedAlert] = useState<IAutomationMetadataObject>(alert);
    const canSubmit = updatedAlert.alert?.trigger.mode !== alert.alert?.trigger.mode;

    return (
        <div className="gd-edit-alert-configuration">
            <div className="gd-edit-alert-configuration__form">
                <div className="gd-edit-alert-configuration__trigger-label">
                    Trigger{" "}
                    <Icon.QuestionMark
                        className="gd-edit-alert-configuration__trigger-label-icon"
                        color={"#94A1AD"} // com-6
                    />
                </div>
                <div className="gd-edit-alert-configuration__trigger-select">
                    <AlertTriggerModeSelect
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
                        Cancel
                    </Button>
                    <Button
                        intent="action"
                        size="small"
                        disabled={!canSubmit}
                        onClick={() => onUpdate(updatedAlert)}
                    >
                        Save
                    </Button>
                </div>
            </div>
        </div>
    );
};
