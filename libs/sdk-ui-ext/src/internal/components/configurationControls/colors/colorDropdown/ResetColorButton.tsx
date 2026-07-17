// (C) 2026 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { Button } from "@gooddata/sdk-ui-kit";

import { messages } from "../../../../../locales.js";
import { getTranslation } from "../../../../utils/translations.js";

export interface IResetColorButtonProps {
    onClick: () => void;
}

export const ResetColorButton = memo(function ResetColorButton({ onClick }: IResetColorButtonProps) {
    const intl = useIntl();

    return (
        <div className="gd-color-drop-down-reset-section">
            <Button
                value={getTranslation(messages["resetColor"].id, intl)}
                className="gd-button-link gd-color-drop-down-reset-section-button s-reset-color-button"
                onClick={onClick}
            />
        </div>
    );
});
