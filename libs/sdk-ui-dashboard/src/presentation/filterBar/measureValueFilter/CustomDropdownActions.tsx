// (C) 2026 GoodData Corporation

import {
    AttributeFilterConfigurationButton,
    type IMeasureValueFilterDropdownActionsProps,
} from "@gooddata/sdk-ui-filters";
import { Button, UiTooltip } from "@gooddata/sdk-ui-kit";

/**
 * @internal
 */
export interface ICustomMeasureValueFilterDropdownActionsProps extends IMeasureValueFilterDropdownActionsProps {
    onConfigurationButtonClick: () => void;
    cancelText: string;
    applyText: string;
    isConfigurationButtonVisible: boolean;
}

/**
 * @internal
 */
export function CustomMeasureValueFilterDropdownActions({
    isApplyDisabled,
    onApplyButtonClick,
    onCancelButtonClick,
    onConfigurationButtonClick,
    cancelText,
    applyText,
    applyDisabledTooltip,
    withoutApply,
    isConfigurationButtonVisible,
}: ICustomMeasureValueFilterDropdownActionsProps) {
    return (
        <div className="gd-measure-value-filter-dropdown-actions__next">
            <div className="gd-measure-value-filter-dropdown-actions-left-content__next">
                {isConfigurationButtonVisible ? (
                    <AttributeFilterConfigurationButton onConfiguration={onConfigurationButtonClick} />
                ) : null}
            </div>
            <div className="gd-measure-value-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-measure-value-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-mvf-dropdown-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                {withoutApply ? null : (
                    <UiTooltip
                        content={applyDisabledTooltip}
                        triggerBy={["hover", "focus"]}
                        disabled={!isApplyDisabled || !applyDisabledTooltip}
                        arrowPlacement="left"
                        optimalPlacement
                        anchor={
                            <Button
                                className="gd-measure-value-filter-apply-button__next gd-button-action gd-button-small s-mvf-dropdown-apply"
                                onClick={onApplyButtonClick}
                                value={applyText}
                                title={applyText}
                                disabled={isApplyDisabled}
                                describedByFromValidation
                            />
                        }
                    />
                )}
            </div>
        </div>
    );
}

/**
 * @internal
 */
export interface ICustomConfigureMeasureValueFilterDropdownActionsProps {
    onSaveButtonClick: () => void;
    onCancelButtonClick: () => void;
    isSaveDisabled?: boolean;
    cancelText: string;
    saveText: string;
}

/**
 * @internal
 */
export function CustomConfigureMeasureValueFilterDropdownActions({
    isSaveDisabled,
    onSaveButtonClick,
    onCancelButtonClick,
    cancelText,
    saveText,
}: ICustomConfigureMeasureValueFilterDropdownActionsProps) {
    return (
        <div className="gd-measure-value-filter-dropdown-actions__next">
            <div className="gd-measure-value-filter-dropdown-actions-left-content__next" />
            <div className="gd-measure-value-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-measure-value-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-mvf-dropdown-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    className="gd-measure-value-filter-apply-button__next gd-button-action gd-button-small s-mvf-dropdown-apply"
                    onClick={onSaveButtonClick}
                    value={saveText}
                    title={saveText}
                    disabled={isSaveDisabled}
                />
            </div>
        </div>
    );
}
