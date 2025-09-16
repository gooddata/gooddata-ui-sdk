// (C) 2023-2025 GoodData Corporation

import { DropdownButton, IToggleButtonProps } from "@gooddata/sdk-ui-kit";

function NumberFormatToggleButton({
    disabled,
    isOpened,
    selectedPreset,
    toggleDropdown,
}: IToggleButtonProps) {
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
}

export default NumberFormatToggleButton;
