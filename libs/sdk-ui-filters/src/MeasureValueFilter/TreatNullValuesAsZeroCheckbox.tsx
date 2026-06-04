// (C) 2020-2026 GoodData Corporation

import { type ChangeEvent, type ReactElement } from "react";

import { type WrappedComponentProps } from "react-intl";

import { Bubble, BubbleHoverTrigger, useIdPrefixed } from "@gooddata/sdk-ui-kit";

interface ITreatNullValuesAsZeroCheckboxProps {
    checked?: boolean;
    onChange: (checked: boolean) => void;
    isMobile?: boolean;
    isViewMode?: boolean;
}

export function TreatNullValuesAsZeroCheckbox({
    checked = false,
    onChange,
    isMobile = false,
    isViewMode = false,
    intl,
}: ITreatNullValuesAsZeroCheckboxProps & WrappedComponentProps): ReactElement {
    const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.checked);
    const tooltipText = intl.formatMessage({ id: "mvf.treatNullValuesAsZeroTooltip" });
    const tooltipId = useIdPrefixed("mvf-treat-null-values-as-zero-tooltip");
    const showTooltip = !isMobile && !isViewMode;

    return (
        <label
            className={"input-checkbox-label gd-mvf-treat-null-values-as-zero s-treat-null-values-as-zero"}
            data-testid="mvf-treat-null-values-as-zero"
        >
            <input
                type="checkbox"
                name={"treat-null-values-as"}
                className={"input-checkbox"}
                checked={checked}
                onChange={handleOnChange}
                aria-describedby={tooltipId}
            />
            <span className="input-label-text">
                {intl.formatMessage({ id: "mvf.treatNullValuesAsZeroLabel" })}
                {showTooltip ? (
                    <BubbleHoverTrigger showDelay={400} hideDelay={200}>
                        <span className={"inlineBubbleHelp"} aria-hidden="true" />
                        <Bubble className="bubble-primary" alignPoints={[{ align: "tc bl" }]}>
                            {tooltipText}
                        </Bubble>
                    </BubbleHoverTrigger>
                ) : null}
            </span>
            {/* Always-present, screen-reader-only copy of the help text so the checkbox has a
                stable description (the hover bubble is only mounted while hovered/focused). */}
            <span className="sr-only" id={tooltipId}>
                {tooltipText}
            </span>
        </label>
    );
}
