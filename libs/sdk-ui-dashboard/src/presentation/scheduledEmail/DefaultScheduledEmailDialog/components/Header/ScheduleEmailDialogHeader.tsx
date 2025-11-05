// (C) 2025 GoodData Corporation

import { ChangeEvent, FocusEvent, KeyboardEvent, ReactNode, forwardRef, useCallback } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";

import { createInvalidDatapoint, createInvalidNode, useValidationContextValue } from "@gooddata/sdk-ui";
import { Bubble, BubbleHoverTrigger, Button, IconError, useIdPrefixed } from "@gooddata/sdk-ui-kit";

const TITLE_MAX_LENGTH = 255;

interface IScheduledEmailDialogHeaderProps {
    title: string;
    placeholder: string;
    isSecondaryTitleVisible?: boolean;
    secondaryTitle?: string;
    secondaryTitleIcon: ReactNode;
    onChange: (value: string, isValid: boolean) => void;
    onKeyDownSubmit: (e: KeyboardEvent) => void;
    onBack?: () => void;
}

export const ScheduledEmailDialogHeader = forwardRef<HTMLInputElement, IScheduledEmailDialogHeaderProps>(
    (props, ref) => {
        const {
            title,
            placeholder,
            secondaryTitle,
            secondaryTitleIcon,
            isSecondaryTitleVisible,
            onChange,
            onBack,
            onKeyDownSubmit,
        } = props;

        const { formatMessage } = useIntl();

        const validationContextValue = useValidationContextValue(
            createInvalidNode({ id: "ScheduleEmailDialogHeader" }),
        );
        const { isValid, getInvalidDatapoints, setInvalidDatapoints } = validationContextValue;
        const invalidDatapoint = getInvalidDatapoints()[0];

        const errorId = useIdPrefixed("error");

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
                            { value: TITLE_MAX_LENGTH },
                        ),
                    }),
                ]);
            },
            [errorId, formatMessage, setInvalidDatapoints],
        );

        const isValueValid = useCallback((value: string) => {
            return value.length <= TITLE_MAX_LENGTH;
        }, []);

        const dialogHeaderClasses = cx(
            "gd-notifications-channels-dialog-title",
            "s-gd-notifications-channels-dialog-title",
            {
                placeholder: title === "",
                "has-error": !isValid,
            },
        );

        const inputHeaderClasses = cx("gd-input-field", {
            "has-error": !isValid,
        });

        const handleOnChange = useCallback(
            (e: ChangeEvent<HTMLInputElement>) => {
                const { value } = e.target;
                const validationResult = isValueValid(value);

                if (!isValid) {
                    setHasError(!validationResult);
                }

                onChange(value, validationResult);
            },
            [isValueValid, isValid, onChange, setHasError],
        );

        const handleBlur = useCallback(
            (e: FocusEvent<HTMLInputElement>) => {
                setHasError(!isValueValid(e.target.value));
            },
            [isValueValid, setHasError],
        );

        return (
            <div
                className={cx("gd-notifications-channels-dialog-header", {
                    "gd-notifications-channels-dialog-header--large": isSecondaryTitleVisible,
                })}
            >
                <Button
                    className="gd-button-primary gd-button-icon-only gd-icon-navigateleft s-schedule-email-dialog-button"
                    onClick={onBack}
                    accessibilityConfig={{
                        ariaLabel: formatMessage({ id: "dialogs.schedule.email.backLabel" }),
                    }}
                />

                <div className={dialogHeaderClasses}>
                    <div className="gd-input-wrapper">
                        <input
                            ref={ref}
                            type="text"
                            autoFocus
                            className={inputHeaderClasses}
                            onBlur={handleBlur}
                            value={title}
                            placeholder={placeholder}
                            onChange={handleOnChange}
                            onKeyDown={onKeyDownSubmit}
                            autoComplete="off"
                            aria-describedby={isValid ? undefined : errorId}
                            aria-label={formatMessage({
                                id: "dialogs.schedule.accessibility.label.email.title",
                            })}
                        />
                        {invalidDatapoint ? (
                            <span id={errorId} className="gd-notifications-channels-dialog-error-icon">
                                <div className={"sr-only"}>{invalidDatapoint.message}</div>

                                <BubbleHoverTrigger showDelay={0} hideDelay={0}>
                                    <IconError width={18} height={18} />
                                    <Bubble
                                        className="bubble-negative"
                                        arrowOffsets={{ "cr cl": [11, -5] }}
                                        alignPoints={[{ align: "cr cl" }]}
                                    >
                                        {invalidDatapoint.message}
                                    </Bubble>
                                </BubbleHoverTrigger>
                            </span>
                        ) : null}
                        {isSecondaryTitleVisible ? (
                            <div className="gd-notifications-channels-dialog-title-secondary">
                                <div className="gd-notifications-channels-dialog-title-secondary-icon">
                                    {secondaryTitleIcon}
                                </div>
                                <div className="gd-notifications-channels-dialog-title-secondary-text">
                                    {secondaryTitle}
                                </div>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    },
);

ScheduledEmailDialogHeader.displayName = "ScheduledEmailDialogHeader";
