// (C) 2026 GoodData Corporation

import { type KeyboardEvent, type ReactNode } from "react";

import cx from "classnames";
import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";
import { Bubble, BubbleHoverTrigger, isSpaceKey } from "@gooddata/sdk-ui-kit";

import { ExcludeCurrentPeriodToggleLabel } from "../ExcludeCurrentPeriodToggle/ExcludeCurrentPeriodToggleLabel.js";

export type EmptyValuesHandlingMode = "exclude" | "include";

interface ICheckboxSectionProps {
    className?: string;
    visible?: boolean;
    showDivider?: boolean;

    emptyValuesHandling?: {
        mode: EmptyValuesHandlingMode;
        checked: boolean;
        onChange: (checked: boolean) => void;
        testId?: string;
    };

    excludeCurrentPeriod?: {
        value: boolean;
        onChange: (excludeCurrentPeriod: boolean) => void;
        disabled?: boolean;
        granularity?: DateFilterGranularity;
        testId?: string;
    };
}

const alignPoints = [{ align: "tc bc" }];

const EMPTY_VALUES_LABEL_ID_BY_MODE: Record<EmptyValuesHandlingMode, string> = {
    exclude: "filters.emptyValuesHandling.exclude",
    include: "filters.emptyValuesHandling.include",
};

function CheckboxItem({
    checked,
    onChange,
    disabled,
    label,
    tooltip,
    testId,
    className,
}: {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    label: ReactNode;
    tooltip?: ReactNode;
    testId?: string;
    className?: string;
}) {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (disabled) {
            return;
        }

        if (isSpaceKey(e)) {
            e.preventDefault();
            onChange(!checked);
        }
    };

    return (
        <BubbleHoverTrigger>
            <label className={cx("input-checkbox-label", className, { "is-disabled": disabled })}>
                <input
                    type="checkbox"
                    className="input-checkbox"
                    checked={checked}
                    onChange={(e) => onChange(e.target.checked)}
                    disabled={disabled}
                    onKeyDown={handleKeyDown}
                    {...(testId ? { "data-testid": testId } : {})}
                />
                &ensp;
                {label}
            </label>
            {disabled && tooltip ? <Bubble alignPoints={alignPoints}>{tooltip}</Bubble> : null}
        </BubbleHoverTrigger>
    );
}

export function CheckboxSection({
    className,
    visible = true,
    showDivider = false,
    emptyValuesHandling,
    excludeCurrentPeriod,
}: ICheckboxSectionProps) {
    if (!visible || (!emptyValuesHandling && !excludeCurrentPeriod)) {
        return null;
    }

    return (
        <>
            {showDivider ? <div className="gd-date-filter-menu-divider" /> : null}
            <div
                className={cx(
                    "gd-extended-date-filter-exclude-current",
                    "gd-date-filter-checkbox-section",
                    className,
                )}
            >
                {emptyValuesHandling ? (
                    <div className="gd-date-filter-checkbox-section-item">
                        <CheckboxItem
                            checked={emptyValuesHandling.checked}
                            onChange={emptyValuesHandling.onChange}
                            label={
                                <FormattedMessage
                                    id={EMPTY_VALUES_LABEL_ID_BY_MODE[emptyValuesHandling.mode]}
                                >
                                    {(...children) => <span className="input-label-text">{children}</span>}
                                </FormattedMessage>
                            }
                            testId={emptyValuesHandling.testId}
                        />
                    </div>
                ) : null}

                {excludeCurrentPeriod ? (
                    <div className="gd-date-filter-checkbox-section-item">
                        <CheckboxItem
                            checked={excludeCurrentPeriod.value}
                            onChange={excludeCurrentPeriod.onChange}
                            disabled={excludeCurrentPeriod.disabled}
                            className="s-exclude-current-period"
                            label={
                                <ExcludeCurrentPeriodToggleLabel
                                    granularity={excludeCurrentPeriod.granularity}
                                    disabled={excludeCurrentPeriod.disabled}
                                />
                            }
                            tooltip={
                                excludeCurrentPeriod.disabled ? (
                                    <FormattedMessage id="filters.excludeCurrentPeriod.unavailable" />
                                ) : null
                            }
                            testId={excludeCurrentPeriod.testId}
                        />
                    </div>
                ) : null}
            </div>
        </>
    );
}
