// (C) 2025 GoodData Corporation
import React, { useState } from "react";
import { Input } from "../Input.js";
import { defineMessage, useIntl } from "react-intl";
import { IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../../../../presentation/constants/index.js";

const MAX_SUBJECT_LENGTH = 300;

const SUBJECT_ERROR_ID = "schedule-subject-error-id";

const errorMessage = defineMessage({ id: "dialogs.schedule.error.too_long" });

interface ISubjectFormProps {
    dashboardTitle: string;
    editedAutomation: IAutomationMetadataObjectDefinition;
    onChange: (value: string, isValid: boolean) => void;
}

export const SubjectForm: React.FC<ISubjectFormProps> = ({ dashboardTitle, editedAutomation, onChange }) => {
    const intl = useIntl();
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateInput = (value: string) => {
        if (value.length > 255) {
            setValidationError(errorMessage.id);
        } else {
            setValidationError(null);
        }
    };

    const handleOnChange = (textAreaValue: string) => {
        if (validationError) {
            validateInput(textAreaValue);
        }
        onChange(textAreaValue, !!validationError);
    };

    return (
        <Input
            id="schedule.subject"
            className="gd-notifications-channels-dialog-subject s-gd-notifications-channels-dialog-subject"
            label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
            maxlength={MAX_SUBJECT_LENGTH}
            autocomplete="off"
            placeholder={
                dashboardTitle.length > DASHBOARD_TITLE_MAX_LENGTH
                    ? dashboardTitle.substring(0, DASHBOARD_TITLE_MAX_LENGTH)
                    : dashboardTitle
            }
            value={editedAutomation.details?.subject ?? ""}
            onChange={handleOnChange}
            onBlur={validateInput}
            validationError={validationError}
            accessibilityErrorId={SUBJECT_ERROR_ID}
        />
    );
};
