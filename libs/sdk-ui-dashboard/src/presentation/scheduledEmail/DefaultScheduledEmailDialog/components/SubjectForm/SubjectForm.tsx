// (C) 2025 GoodData Corporation
import React, { useState, useCallback } from "react";
import { Input, useId } from "@gooddata/sdk-ui-kit";
import { useIntl } from "react-intl";
import { IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import { DASHBOARD_TITLE_MAX_LENGTH } from "../../../../../presentation/constants/index.js";
import { ErrorWrapper } from "../ErrorWrapper/ErrorWrapper.js";

const MAX_SUBJECT_LENGTH = 255;

enum ScheduleEmailSubjectErrorType {
    LONG_VALUE = "LONG_VALUE",
}

interface ISubjectFormProps {
    dashboardTitle: string;
    editedAutomation: IAutomationMetadataObjectDefinition;
    onChange: (value: string, isValid: boolean) => void;
}

export const SubjectForm: React.FC<ISubjectFormProps> = ({ dashboardTitle, editedAutomation, onChange }) => {
    const intl = useIntl();
    const [subjectError, setSubjectError] = useState<string | null>(null);

    const labelId = `${useId()}-label`;
    const errorId = `${useId()}-error`;

    const errorMessage = intl.formatMessage(
        { id: "dialogs.schedule.error.too_long" },
        { value: MAX_SUBJECT_LENGTH },
    );

    const validate = useCallback((value: string) => {
        if (value.length > MAX_SUBJECT_LENGTH) {
            return ScheduleEmailSubjectErrorType.LONG_VALUE;
        }
        return null;
    }, []);

    const handleOnChange = useCallback(
        (value: string) => {
            const validationResult = validate(value);

            if (subjectError) {
                if (validationResult) {
                    setSubjectError(errorMessage);
                } else {
                    setSubjectError(null);
                }
            }
            onChange(value, !validationResult);
        },
        [subjectError, validate, errorMessage, onChange],
    );

    const handleOnBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const validationResult = validate(e.target.value);
            if (validationResult) {
                setSubjectError(errorMessage);
            } else {
                setSubjectError(null);
            }
        },
        [errorMessage, validate],
    );

    return (
        <ErrorWrapper
            errorId={errorId}
            errorMessage={subjectError}
            label={intl.formatMessage({ id: "dialogs.schedule.email.subject.label" })}
            labelId={labelId}
            className="gd-input-component gd-notifications-channels-dialog-subject s-gd-notifications-channels-dialog-subject"
            labelWrapperClassName="gd-notifications-channels-dialog-subject-wrapper"
            errorClassName="gd-notifications-channels-dialog-subject-error"
        >
            <Input
                id="schedule.subject"
                hasError={!!subjectError}
                maxlength={300}
                type="text"
                placeholder={
                    dashboardTitle.length > DASHBOARD_TITLE_MAX_LENGTH
                        ? dashboardTitle.substring(0, DASHBOARD_TITLE_MAX_LENGTH)
                        : dashboardTitle
                }
                value={editedAutomation.details?.subject ?? ""}
                onChange={
                    // as any, the value will indeed always be string
                    // TODO improve typings of Input in ui-kit to have properly typed the onChange related to the input type
                    handleOnChange as any
                }
                autocomplete="off"
                onBlur={handleOnBlur}
                accessibilityConfig={{
                    ariaLabelledBy: labelId,
                    ariaDescribedBy: subjectError ? errorId : undefined,
                }}
            />
        </ErrorWrapper>
    );
};
