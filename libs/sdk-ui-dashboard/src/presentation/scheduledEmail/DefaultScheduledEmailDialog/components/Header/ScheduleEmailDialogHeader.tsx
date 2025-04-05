// (C) 2025 GoodData Corporation
import React, { useEffect, useRef, useState } from "react";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger, Button, Icon } from "@gooddata/sdk-ui-kit";

const errorMessage = defineMessage({ id: "dialogs.schedule.error.too_long" });

const DIALOG_TITLE_ERROR_ID = "dialog-title-error-id";

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
    const inputElement = useRef<HTMLInputElement>(null);
    const [titleError, setTitleError] = useState<string | null>(null);

    useEffect(() => {
        setTimeout(() => {
            if (inputElement.current) {
                inputElement.current.focus();
            }
        }, 100);
    }, []);

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

    const validate = (value: string) => {
        const isValid = value.length <= 255;

        if (isValid) {
            setTitleError(null);
        } else {
            setTitleError(errorMessage.id);
        }

        return isValid;
    };

    const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        if (titleError) {
            validate(value);
        }

        onChange(value, value.length <= 255);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        validate(e.target.value);
    };

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
                <div className="gd-input-wrapper">
                    <input
                        type="text"
                        ref={inputElement}
                        className={inputHeaderClasses}
                        onBlur={handleBlur}
                        value={title}
                        placeholder={placeholder}
                        onChange={handleOnChange}
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
            </div>
        </div>
    );
};
