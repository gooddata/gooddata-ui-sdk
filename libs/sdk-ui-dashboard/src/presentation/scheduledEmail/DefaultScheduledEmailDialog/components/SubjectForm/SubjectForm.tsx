// (C) 2025 GoodData Corporation

import { type FocusEvent, useCallback } from "react";

import { useIntl } from "react-intl";

import { type IAutomationMetadataObjectDefinition } from "@gooddata/sdk-model";
import {
    ValidationContextStore,
    createInvalidDatapoint,
    createInvalidNode,
    useValidationContextValue,
} from "@gooddata/sdk-ui";
import { Input, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { DASHBOARD_TITLE_MAX_LENGTH } from "../../../../../presentation/constants/index.js";
import { ErrorWrapper } from "../ErrorWrapper/ErrorWrapper.js";

const MAX_SUBJECT_LENGTH = 255;

interface ISubjectFormProps {
    dashboardTitle: string;
    editedAutomation: IAutomationMetadataObjectDefinition;
    isSubmitDisabled?: boolean;
    onChange: (value: string, isValid: boolean) => void;
    onKeyDownSubmit: () => void;
}

export function SubjectForm({
    dashboardTitle,
    editedAutomation,
    isSubmitDisabled,
    onChange,
    onKeyDownSubmit,
}: ISubjectFormProps) {
    const { formatMessage } = useIntl();

    const labelId = useIdPrefixed("label");
    const errorId = useIdPrefixed("error");

    const validationContextValue = useValidationContextValue(createInvalidNode({ id: "SubjectForm" }));
    const { setInvalidDatapoints, getInvalidDatapoints, isValid } = validationContextValue;
    const invalidDatapoint = getInvalidDatapoints()[0];

    const setHasError = useCallback(
        (hasError: boolean) => {
            if (!hasError) {
                setInvalidDatapoints(() => []);
                return;
            }

            setInvalidDatapoints(() => [
                createInvalidDatapoint({
                    id: errorId,
                    message: formatMessage(
                        { id: "dialogs.schedule.error.too_long" },
                        { value: MAX_SUBJECT_LENGTH },
                    ),
                }),
            ]);
        },
        [errorId, formatMessage, setInvalidDatapoints],
    );

    const isValueValid = useCallback((value: string) => {
        return value.length <= MAX_SUBJECT_LENGTH;
    }, []);

    const handleOnChange = useCallback(
        (value: string) => {
            const validationResult = isValueValid(value);

            if (!isValid) {
                setHasError(!validationResult);
            }
            onChange(value, validationResult);
        },
        [isValueValid, isValid, onChange, setHasError],
    );

    const handleOnBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            setHasError(!isValueValid(e.target.value));
        },
        [isValueValid, setHasError],
    );

    return (
        <ValidationContextStore value={validationContextValue}>
            <ErrorWrapper
                errorId={errorId}
                errorMessage={invalidDatapoint?.message ?? null}
                label={formatMessage({ id: "dialogs.schedule.email.subject.label" })}
                labelId={labelId}
                className="gd-input-component gd-notifications-channels-dialog-subject s-gd-notifications-channels-dialog-subject"
                labelWrapperClassName="gd-notifications-channels-dialog-subject-wrapper"
                errorClassName="gd-notifications-channels-dialog-subject-error"
            >
                <Input
                    id={labelId}
                    hasError={!isValid}
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
                    onEnterKeyPress={() => {
                        if (!isSubmitDisabled) {
                            onKeyDownSubmit();
                        }
                    }}
                    autocomplete="off"
                    onBlur={handleOnBlur}
                    accessibilityConfig={{
                        ariaDescribedBy: isValid ? undefined : errorId,
                    }}
                />
            </ErrorWrapper>
        </ValidationContextStore>
    );
}
