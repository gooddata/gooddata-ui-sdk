// (C) 2022-2025 GoodData Corporation
import { Button } from "@gooddata/sdk-ui-kit";

import { useIntl } from "react-intl";

interface IConfigurationPanelControlsProps {
    closeHandler: () => void;
    onSave: () => void;
    isSaveButtonEnabled: boolean;
}

export function DropdownControls({
    closeHandler,
    isSaveButtonEnabled,
    onSave,
}: IConfigurationPanelControlsProps) {
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
}
