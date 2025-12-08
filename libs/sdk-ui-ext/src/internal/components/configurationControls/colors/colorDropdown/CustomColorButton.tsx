// (C) 2019-2025 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../../locales.js";
import { getTranslation } from "../../../../utils/translations.js";

export interface ICustomColorButtonProps {
    onClick: () => void;
}

export const CustomColorButton = memo(function CustomColorButton({ onClick }: ICustomColorButtonProps) {
    const intl = useIntl();

    const handleClick = () => {
        onClick();
    };

    return (
        <div className="gd-color-drop-down-custom-section">
            <Button
                value={getTranslation(messages["customColor"].id, intl)}
                className="gd-button-link gd-color-drop-down-custom-section-button s-custom-section-button"
                onClick={handleClick}
            />
        </div>
    );
});
