// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterDropdownActionsProps {
    onApplyButtonClick: () => void;
    onCancelButtonClick: () => void;
    isApplyDisabled?: boolean;
}

/**
 * @alpha
 */
export const AttributeFilterDropdownActions: React.VFC<IAttributeFilterDropdownActionsProps> = ({
    isApplyDisabled,
    onApplyButtonClick,
    onCancelButtonClick,
}) => {
    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });

    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <div className="gd-attribute-filter-dropdown-actions-left-content__next" />
            <div className="gd-attribute-filter-dropdown-actions-right-content__next">
                <Button
                    className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    disabled={isApplyDisabled}
                    className="gd-attribute-filter-apply-button__next gd-button-action gd-button-small s-apply"
                    onClick={onApplyButtonClick}
                    value={applyText}
                    title={applyText}
                />
            </div>
        </div>
    );
};
