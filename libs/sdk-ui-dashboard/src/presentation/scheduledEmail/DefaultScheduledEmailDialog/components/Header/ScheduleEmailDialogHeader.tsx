// (C) 2025 GoodData Corporation
import React, { useState, useCallback } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Button, Icon, UiFocusTrap } from "@gooddata/sdk-ui-kit";

const TITLE_MAX_LENGTH = 255;
const DIALOG_TITLE_ERROR_ID = "dialog-title-error-id";

enum ScheduleEmailTitleErrorType {
    LONG_VALUE = "LONG_VALUE",
}

interface IScheduledEmailDialogHeaderProps {
    title: string;
    onChange: (value: string, isValid: boolean) => void;
    onCancel?: () => void;
    placeholder: string;
}

export const ScheduledEmailDialogHeader: React.FC<IScheduledEmailDialogHeaderProps> = ({
    title,
    onChange,
    onCancel,
    placeholder,
}) => {
    const intl = useIntl();
    const [titleError, setTitleError] = useState<string | null>(null);

    const errorMessage = intl.formatMessage(
        { id: "dialogs.schedule.error.too_long" },
        { value: TITLE_MAX_LENGTH },
    );

    const dialogHeaderClasses = cx(
        "gd-notifications-channels-dialog-title",
        "s-gd-notifications-channels-dialog-title",
        {
            placeholder: title === "",
            "has-error": titleError,
        },
    );

    const inputHeaderClasses = cx("gd-input-field", {
        "has-error": titleError,
    });

    const validate = useCallback((value: string) => {
        if (value.length > TITLE_MAX_LENGTH) {
            return ScheduleEmailTitleErrorType.LONG_VALUE;
        }

        return null;
    }, []);

    const handleOnChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = e.target;
            const validationResult = validate(value);

            if (titleError) {
                if (validationResult) {
                    setTitleError(errorMessage);
                } else {
                    setTitleError(null);
                }
            }

            onChange(value, !validationResult);
        },
        [titleError, validate, errorMessage, onChange],
    );

    const handleBlur = useCallback(
        (e: React.FocusEvent<HTMLInputElement>) => {
            const validationResult = validate(e.target.value);
            if (validationResult) {
                setTitleError(errorMessage);
            } else {
                setTitleError(null);
            }
        },
        [errorMessage, validate],
    );

    return (
        <div className="gd-notifications-channels-dialog-header">
            <Button
                className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-schedule-email-dialog-button"
                onClick={onCancel}
                accessibilityConfig={{
                    ariaLabel: intl.formatMessage({ id: "dialogs.schedule.email.backLabel" }),
                }}
            />

            <div className={dialogHeaderClasses}>
                <UiFocusTrap autofocusOnOpen={true}>
                    <div className="gd-input-wrapper">
                        <input
                            type="text"
                            className={inputHeaderClasses}
                            onBlur={handleBlur}
                            value={title}
                            placeholder={placeholder}
                            onChange={handleOnChange}
                            autoComplete="off"
                            aria-describedby={titleError ? DIALOG_TITLE_ERROR_ID : undefined}
                            aria-label={intl.formatMessage({
                                id: "dialogs.schedule.accessibility.label.email.title",
                            })}
                        />
                        {titleError ? (
                            <span
                                id={DIALOG_TITLE_ERROR_ID}
                                className="gd-notifications-channels-dialog-error-icon"
                            >
                                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                                    <Icon.Error width={18} height={18} />
                                    <Bubble
                                        className="bubble-negative"
                                        arrowOffsets={{ "cr cl": [11, -5] }}
                                        alignPoints={[{ align: "cr cl" }]}
                                    >
                                        <FormattedMessage id={titleError} />
                                    </Bubble>
                                </BubbleHoverTrigger>
                            </span>
                        ) : null}
                    </div>
                </UiFocusTrap>
            </div>
        </div>
    );
};
