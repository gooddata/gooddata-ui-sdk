// (C) 2022 GoodData Corporation
import React from "react";

import { Button } from "@gooddata/sdk-ui-kit";

import { useIntl } from "react-intl";

interface IConfigurationPanelControlsProps {
    closeHandler: () => void;
    onSave: () => void;
    isSaveButtonEnabled: boolean;
}

export const DropdownControls: React.FC<IConfigurationPanelControlsProps> = (props) => {
    const { closeHandler, isSaveButtonEnabled, onSave } = props;
    const intl = useIntl();

    const onSaveHandler = () => {
        onSave();
        closeHandler();
    };

    return (
        <div className="gd-dialog-footer dropdown-footer">
            <Button
                className="gd-button-secondary s-attribute-filter-dropdown-configuration-cancel-button"
                value={intl.formatMessage({ id: "cancel" })}
                disabled={false}
                onClick={() => closeHandler()}
            />
            <Button
                className="gd-button-action s-attribute-filter-dropdown-configuration-save-button"
                value={intl.formatMessage({ id: "attributesDropdown.save" })}
                disabled={!isSaveButtonEnabled}
                onClick={onSaveHandler}
            />
        </div>
    );
};
