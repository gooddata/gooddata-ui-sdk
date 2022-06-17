// (C) 2019-2022 GoodData Corporation
import React from "react";
import { useIntl } from "react-intl";
import { Button } from "@gooddata/sdk-ui-kit";

interface IAttributeDropdownButtonsProps {
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    applyDisabled?: boolean;
}

export const AttributeDropdownButtons: React.VFC<IAttributeDropdownButtonsProps> = ({
    applyDisabled,
    onApplyButtonClicked,
    onCloseButtonClicked,
}) => {
    const intl = useIntl();

    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });

    return (
        <div className="gd-attribute-filter-actions__next">
            <Button
                className="gd-button-secondary gd-button-small cancel-button s-cancel"
                onClick={onCloseButtonClicked}
                value={cancelText}
                title={cancelText}
            />
            <Button
                disabled={applyDisabled}
                className="gd-button-action gd-button-small s-apply"
                onClick={onApplyButtonClicked}
                value={applyText}
                title={applyText}
            />
        </div>
    );
};
