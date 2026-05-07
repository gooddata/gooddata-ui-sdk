// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { Button, UiTooltip } from "@gooddata/sdk-ui-kit";

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

    return (
        <div className="gd-mvf-dropdown-footer">
            <Button
                className="gd-button-secondary gd-button-small s-mvf-dropdown-cancel"
                onClick={onCancelButtonClick}
                value={withoutApply ? closeText : cancelText}
                title={withoutApply ? closeText : cancelText}
            />
            {withoutApply ? null : (
                <UiTooltip
                    content={applyDisabledTooltip}
                    triggerBy={["hover"]}
                    disabled={!isApplyDisabled || !applyDisabledTooltip}
                    arrowPlacement="left"
                    optimalPlacement
                    anchor={
                        <Button
                            className="gd-button-action gd-button-small s-mvf-dropdown-apply"
                            onClick={onApplyButtonClick}
                            value={intl.formatMessage({ id: "apply" })}
                            disabled={isApplyDisabled}
                        />
                    }
                />
            )}
        </div>
    );
}
