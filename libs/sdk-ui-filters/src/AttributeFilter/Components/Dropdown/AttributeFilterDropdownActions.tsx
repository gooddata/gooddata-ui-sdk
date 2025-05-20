// (C) 2019-2025 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 * AttributeFilter dropdown actions like confirm and cancel button.
 * @beta
 */
export interface IAttributeFilterDropdownActionsProps {
    /**
     * Callback to apply changes of current selection.
     *
     * @beta
     */
    onApplyButtonClick: () => void;

    /**
     * Callback to discard changes and close AttributeFilter.
     *
     * @beta
     */
    onCancelButtonClick: () => void;

    /**
     * If true, the Apply action should be disabled.
     *
     * @beta
     */
    isApplyDisabled?: boolean;

    /**
     * If true, the Apply button is not rendered, Cancel button is renamed to Close and status bar is not rendered.
     *
     * @alpha
     */
    withoutApply?: boolean;
}

/**
 * This component displays two buttons Apply and Cancel.
 * Apply button is disabled when selection is not changed.
 * Cancel button discard changes and close AttributeFilter dropdown.
 *
 * @beta
 */
export const AttributeFilterDropdownActions: React.VFC<IAttributeFilterDropdownActionsProps> = ({
    isApplyDisabled,
    onApplyButtonClick,
    onCancelButtonClick,
    withoutApply,
}) => {
    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const closeText = intl.formatMessage({ id: "close" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });

    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <div className="gd-attribute-filter-dropdown-actions-left-content__next" />
            <div className="gd-attribute-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                    onClick={onCancelButtonClick}
                    value={withoutApply ? closeText : cancelText}
                    title={withoutApply ? closeText : cancelText}
                />
                {!withoutApply && (
                    <Button
                        disabled={isApplyDisabled}
                        className="gd-attribute-filter-apply-button__next gd-button-action gd-button-small s-apply"
                        onClick={onApplyButtonClick}
                        value={applyText}
                        title={applyText}
                    />
                )}
            </div>
        </div>
    );
};
