// (C) 2019 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export const EditModeMessage: React.FC = () => (
    <div className="s-extended-date-filter-edit-mode-message gd-extended-date-filter-edit-mode-message">
        <div className="gd-extended-date-filter-edit-mode-message-text">
            <FormattedMessage id="dateFilterDropdown.setDefault" />
        </div>
        <hr className="gd-separator-generic" />
    </div>
);
