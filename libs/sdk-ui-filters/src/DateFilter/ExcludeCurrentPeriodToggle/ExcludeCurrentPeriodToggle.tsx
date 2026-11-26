// (C) 2007-2026 GoodData Corporation

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { CheckboxDescription } from "../CheckboxSection/CheckboxDescription.js";

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
    const labelId = useIdPrefixed("exclude-current-period-label");
    const descriptionId = useIdPrefixed("exclude-current-period-description");

    // Space is left to the native checkbox so assistive technologies announce the state change.
    return (
        <div className="gd-extended-date-filter-exclude-current">
            <BubbleHoverTrigger>
                <label
                    className={cx("s-exclude-current-period", "input-checkbox-label", {
                        "is-disabled": disabled,
                    })}
                >
                    <input
                        type="checkbox"
                        className="input-checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        disabled={disabled}
                        aria-labelledby={labelId}
                        aria-describedby={disabled ? descriptionId : undefined}
                    />
                    &ensp;
                    <ExcludeCurrentPeriodToggleLabel
                        granularity={granularity}
                        disabled={disabled}
                        id={labelId}
                    />
                </label>
                {disabled ? (
                    <Bubble alignPoints={alignPoints}>
                        <FormattedMessage id="filters.excludeCurrentPeriod.unavailable" />
                    </Bubble>
                ) : null}
            </BubbleHoverTrigger>
            {disabled ? (
                <CheckboxDescription id={descriptionId}>
                    <FormattedMessage id="filters.excludeCurrentPeriod.unavailable" />
                </CheckboxDescription>
            ) : null}
        </div>
    );
}
