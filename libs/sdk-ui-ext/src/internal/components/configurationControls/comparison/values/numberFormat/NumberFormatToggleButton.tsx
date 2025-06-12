// (C) 2023 GoodData Corporation
import React from "react";

import { IToggleButtonProps, DropdownButton } from "@gooddata/sdk-ui-kit";

const NumberFormatToggleButton: React.FC<IToggleButtonProps> = ({
    disabled,
    isOpened,
    selectedPreset,
    toggleDropdown,
}) => {
    return (
        <div className="adi-bucket-dropdown number-format-toggle-button s-number-format-toggle-button">
            <DropdownButton
                title={selectedPreset.name}
                value={selectedPreset.name}
                onClick={toggleDropdown}
                isOpen={isOpened}
                disabled={disabled}
            />
        </div>
    );
};

export default NumberFormatToggleButton;
