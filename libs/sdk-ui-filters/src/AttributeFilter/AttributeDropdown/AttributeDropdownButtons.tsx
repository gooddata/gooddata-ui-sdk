// (C) 2019 GoodData Corporation
import * as React from "react";
import { WrappedComponentProps, injectIntl } from "react-intl";
import Button from "@gooddata/goodstrap/lib/Button/Button";

interface IAttributeDropdownButtonsProps {
    onApplyButtonClicked: () => void;
    onCloseButtonClicked: () => void;
    applyDisabled?: boolean;
}

const AttributeDropdownButtonsWrapped: React.FC<IAttributeDropdownButtonsProps & WrappedComponentProps> = ({
    applyDisabled,
    intl,
    onApplyButtonClicked,
    onCloseButtonClicked,
}) => {
    const cancelText = intl.formatMessage({ id: "gs.list.cancel" });
    const applyText = intl.formatMessage({ id: "gs.list.apply" });
    return (
        <div className="gd-attribute-filter-actions">
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

export const AttributeDropdownButtons = injectIntl(AttributeDropdownButtonsWrapped);
