// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

/**
 * @alpha
 */
export interface IAttributeFilterDropdownActionsProps {
    onApplyButtonClick: () => void;
    onCloseButtonClick: () => void;
    isApplyDisabled?: boolean;
}

/**
 * @internal
 */
export const AttributeFilterDropdownActions: React.VFC<IAttributeFilterDropdownActionsProps> = ({
    isApplyDisabled,
    onApplyButtonClick,
    onCloseButtonClick,
}) => {
    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });

    return (
        <div className="gd-attribute-filter-dropdown-actions__next">
            <Button
                className="gd-attribute-filter-cancel-button__next gd-button-secondary gd-button-small cancel-button s-cancel"
                onClick={onCloseButtonClick}
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
    );
};
