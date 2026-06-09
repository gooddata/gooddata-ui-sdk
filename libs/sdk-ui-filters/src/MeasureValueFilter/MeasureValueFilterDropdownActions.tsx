// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button, UiTooltip, useIdPrefixed } from "@gooddata/sdk-ui-kit";

import { type IMeasureValueFilterDropdownActionsProps } from "./typings.js";

/**
 * Default Apply/Cancel footer rendered inside the Measure Value Filter dropdown.
 *
 * Mirrors the behaviour of the attribute filter's
 * {@link AttributeFilterDropdownActions}: when `withoutApply` is `true` the Apply
 * button is hidden and the Cancel button is rendered as Close. Hosts that supply
 * their own {@link IMeasureValueFilterCustomComponentProps.DropdownActionsComponent}
 * can compose with this default to add extra controls without re-implementing the
 * Apply/Cancel pipeline.
 *
 * @beta
 */
export function MeasureValueFilterDropdownActions({
    onApplyButtonClick,
    onCancelButtonClick,
    isApplyDisabled,
    applyDisabledTooltip,
    withoutApply,
}: IMeasureValueFilterDropdownActionsProps) {
    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "cancel" });
    const closeText = intl.formatMessage({ id: "close" });

    // The Apply button stays focusable while disabled (it uses aria-disabled, not the native
    // disabled attribute), so the reason it is disabled must reach screen readers as the button's
    // description — the visual hover/focus tooltip alone is not announced. We expose it via a
    // visually hidden element referenced by aria-describedby (WCAG 4.1.2 / 1.3.1).
    const applyDescriptionId = useIdPrefixed("mvf-apply-disabled-desc");
    const showApplyDescription = !!isApplyDisabled && !!applyDisabledTooltip;

    return (
        <div className="gd-mvf-dropdown-footer">
            <Button
                className="gd-button-secondary gd-button-small s-mvf-dropdown-cancel"
                onClick={onCancelButtonClick}
                value={withoutApply ? closeText : cancelText}
                title={withoutApply ? closeText : cancelText}
            />
            {withoutApply ? null : (
                <>
                    <UiTooltip
                        content={applyDisabledTooltip}
                        triggerBy={["hover", "focus"]}
                        disabled={!isApplyDisabled || !applyDisabledTooltip}
                        arrowPlacement="left"
                        optimalPlacement
                        anchor={
                            <Button
                                className="gd-button-action gd-button-small s-mvf-dropdown-apply"
                                onClick={onApplyButtonClick}
                                value={intl.formatMessage({ id: "apply" })}
                                disabled={isApplyDisabled}
                                accessibilityConfig={
                                    showApplyDescription ? { ariaDescribedBy: applyDescriptionId } : undefined
                                }
                            />
                        }
                    />
                    {showApplyDescription ? (
                        <span id={applyDescriptionId} className="sr-only">
                            {applyDisabledTooltip}
                        </span>
                    ) : null}
                </>
            )}
        </div>
    );
}
