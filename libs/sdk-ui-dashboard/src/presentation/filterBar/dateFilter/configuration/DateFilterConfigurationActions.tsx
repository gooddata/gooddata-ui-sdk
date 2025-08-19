// (C) 2023-2025 GoodData Corporation
import React from "react";

import { Button } from "@gooddata/sdk-ui-kit";

export interface ICustomConfigureDateFilterDropdownActionsProps {
    onSaveButtonClick: () => void;
    onCancelButtonClick: () => void;
    isSaveDisabled?: boolean;
    cancelText: string;
    saveText: string;
}

export const DateFilterConfigurationActions: React.FC<ICustomConfigureDateFilterDropdownActionsProps> = ({
    isSaveDisabled,
    onSaveButtonClick,
    onCancelButtonClick,
    cancelText,
    saveText,
}) => {
    return (
        <div className="gd-extended-date-filter-actions">
            <div className="gd-extended-date-filter-actions-left-content" />
            <div className="gd-extended-date-filter-actions-right-content s-gd-extended-date-filter-actions-right-content">
                <Button
                    className="gd-button-secondary gd-button-small s-date-filter-cancel"
                    onClick={onCancelButtonClick}
                    value={cancelText}
                    title={cancelText}
                />
                <Button
                    disabled={isSaveDisabled}
                    className="gd-button-action gd-button-small s-date-filter-apply"
                    onClick={onSaveButtonClick}
                    value={saveText}
                    title={saveText}
                />
            </div>
        </div>
    );
};
