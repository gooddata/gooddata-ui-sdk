// (C) 2007-2025 GoodData Corporation

import { type KeyboardEvent } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, isSpaceKey } from "@gooddata/sdk-ui-kit";

import { ExcludeCurrentPeriodToggleLabel } from "./ExcludeCurrentPeriodToggleLabel.js";

interface IExcludeCurrentPeriodToggleProps {
    value: boolean;
    onChange: (excludeCurrentPeriod: boolean) => void;
    disabled?: boolean;
    granularity?: DateFilterGranularity;
}

const alignPoints = [{ align: "tc bc" }];

export function ExcludeCurrentPeriodToggle({
    value,
    onChange,
    disabled,
    granularity,
}: IExcludeCurrentPeriodToggleProps) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (disabled) {
            return;
        }

        if (isSpaceKey(e)) {
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
}
