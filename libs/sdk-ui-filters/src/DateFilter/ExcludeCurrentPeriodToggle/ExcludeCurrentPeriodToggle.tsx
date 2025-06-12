// (C) 2007-2025 GoodData Corporation
import React from "react";
import cx from "classnames";
import { FormattedMessage } from "react-intl";
import { Bubble, BubbleHoverTrigger, isActionKey } from "@gooddata/sdk-ui-kit";
import { DateFilterGranularity } from "@gooddata/sdk-model";

import { ExcludeCurrentPeriodToggleLabel } from "./ExcludeCurrentPeriodToggleLabel.js";

interface IExcludeCurrentPeriodToggleProps {
    value: boolean;
    onChange: (excludeCurrentPeriod: boolean) => void;
    disabled?: boolean;
    granularity?: DateFilterGranularity;
}

const alignPoints = [{ align: "tc bc" }];

export const ExcludeCurrentPeriodToggle: React.FC<IExcludeCurrentPeriodToggleProps> = ({
    value,
    onChange,
    disabled,
    granularity,
}) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) {
            return;
        }

        if (isActionKey(e)) {
            e.preventDefault();
            onChange(!value);
        }
    };

    return (
        <div className="gd-extended-date-filter-exclude-current">
            <BubbleHoverTrigger>
                <label
                    className={cx("s-exclude-current-period", "input-checkbox-label", {
                        "s-exclude-current-perod-enabled": !disabled,
                        "s-exclude-current-perod-disabled": disabled,
                    })}
                >
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={disabled}
                        onKeyDown={handleKeyDown}
                    />
                    &ensp;
                    <ExcludeCurrentPeriodToggleLabel granularity={granularity} disabled={disabled} />
                </label>
                {disabled ? (
                    <Bubble alignPoints={alignPoints}>
                        <FormattedMessage id="filters.excludeCurrentPeriod.unavailable" />
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
        </div>
    );
};
