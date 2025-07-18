// (C) 2024-2025 GoodData Corporation

import { useCallback, useState, FocusEvent, ChangeEvent } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import cx from "classnames";
import { Bubble, BubbleHoverTrigger } from "../Bubble/index.js";
import { IAccessibilityConfigBase } from "../typings/accessibility.js";

interface ICronExpressionProps {
    expression: string;
    description?: string;
    onChange: (expression: string) => void;
    onBlur: (expression: string) => void;
    allowHourlyRecurrence?: boolean;
    timezone?: string;
    showTimezone?: boolean;
    disabled?: boolean;
    validationError?: string;
    accessibilityConfig?: IAccessibilityConfigBase;
}

export function CronExpression({
    expression,
    description,
    onChange,
    onBlur,
    showTimezone,
    timezone,
    disabled,
    validationError,
    accessibilityConfig,
}: ICronExpressionProps) {
    const intl = useIntl();
    const [originalExpression] = useState(expression);
    const [changed, setChanged] = useState(false);

    const handleBlur = useCallback(
        (e: FocusEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onBlur(value);
        },
        [onBlur],
    );

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            onChange(value);
            setChanged(originalExpression !== value);
        },
        [onChange, originalExpression],
    );

    const cronPlaceholder = "* * * * * *";
    const hasTimezone = Boolean(showTimezone && timezone);
    const hasDescription = Boolean(description);

    return (
        <>
            <div
                className={cx("gd-recurrence-form-cron s-recurrence-form-cron", {
                    "has-error": !!validationError,
                    "is-disabled": disabled,
                })}
            >
                <input
                    className="gd-input-field"
                    type="text"
                    onChange={handleChange}
                    onBlur={handleBlur}
                    value={expression}
                    placeholder={cronPlaceholder}
                    disabled={disabled}
                    aria-describedby={accessibilityConfig?.ariaDescribedBy}
                    aria-labelledby={accessibilityConfig?.ariaLabelledBy}
                />
            </div>
            {hasDescription || hasTimezone ? (
                <div className="gd-recurrence-form-repeat-type-description s-recurrence-form-repeat-type-description">
                    {hasDescription && !changed ? <span>{description}</span> : null}
                    {hasTimezone ? (
                        <>
                            <FormattedMessage id="gs.date.at" tagName="span" />
                            <BubbleHoverTrigger
                                showDelay={0}
                                hideDelay={0}
                                className="gd-recurrence-form-timezone-wrapper"
                            >
                                <span className="gd-recurrence-form-timezone">
                                    {" "}
                                    {timezone} {intl.formatMessage({ id: "gs.time" })}
                                </span>
                                <Bubble className="bubble-primary" alignPoints={[{ align: "bc tc" }]}>
                                    {timezone} {intl.formatMessage({ id: "gs.time" })}
                                </Bubble>
                            </BubbleHoverTrigger>
                        </>
                    ) : null}
                </div>
            ) : null}
        </>
    );
}
