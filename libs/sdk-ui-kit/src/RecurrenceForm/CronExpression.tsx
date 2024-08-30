// (C) 2024 GoodData Corporation

import React, { useEffect, useState } from "react";
import { defineMessage, FormattedMessage } from "react-intl";
import { useTheme } from "@gooddata/sdk-ui-theme-provider";
import cx from "classnames";
import { isCronExpressionValid } from "./utils.js";
import { BubbleHoverTrigger } from "../Bubble/BubbleHoverTrigger.js";
import { Bubble } from "../Bubble/Bubble.js";
import { Icon } from "../Icon/Icon.js";
import { GD_COLOR_STATE_BLANK } from "../utils/constants.js";

const TOOLTIP_ALIGN_POINTS = [{ align: "cr cl" }];

const errorMessage = defineMessage({ id: "recurrence.error.too_often" });

interface ICronExpressionProps {
    expression: string;
    onChange: (expression: string, isValid: boolean) => void;
    allowHourlyRecurrence?: boolean;
}

export const CronExpression: React.FC<ICronExpressionProps> = (props) => {
    const { expression, onChange, allowHourlyRecurrence } = props;
    const theme = useTheme();
    const [validationError, setValidationError] = useState<string | null>(null);

    const validateExpression = (expression: string) => {
        const isValid = isCronExpressionValid(expression, allowHourlyRecurrence);

        if (isValid) {
            setValidationError(null);
        } else {
            setValidationError(errorMessage.id);
        }

        return isValid;
    };

    useEffect(() => {
        validateExpression(expression);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const isValid = validateExpression(value);
        onChange(value, isValid);
    };

    return (
        <>
            <div
                className={cx("gd-recurrence-form-cron s-recurrence-form-cron", {
                    "has-error": !!validationError,
                })}
            >
                <input className="gd-input-field" onChange={handleChange} value={expression} />
                {validationError ? (
                    <span className="gd-recurrence-form-cron-error-message">
                        <FormattedMessage id={validationError} />
                    </span>
                ) : null}
            </div>
            <BubbleHoverTrigger tagName="div" className="gd-recurrence-form-cron-icon" eventsOnBubble={true}>
                <Icon.QuestionMark
                    color={theme?.palette?.complementary?.c6 ?? GD_COLOR_STATE_BLANK}
                    width={14}
                    height={14}
                />
                <Bubble className="bubble-primary" alignPoints={TOOLTIP_ALIGN_POINTS}>
                    <FormattedMessage
                        id="recurrence.cron.tooltip"
                        values={{
                            a: (chunk: React.ReactNode) => (
                                <a
                                    href="https://www.gooddata.com/docs/cloud/experimental-features/scheduled-exports/#cron-format"
                                    rel="noopener noreferrer"
                                    target="_blank"
                                >
                                    {chunk}
                                </a>
                            ),
                        }}
                    />
                </Bubble>
            </BubbleHoverTrigger>
        </>
    );
};
