// (C) 2019-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

export function EditModeMessage() {
    return (
        <div className="s-extended-date-filter-edit-mode-message gd-extended-date-filter-edit-mode-message">
            <div className="gd-extended-date-filter-edit-mode-message-text">
                <FormattedMessage
                    id="dateFilterDropdown.setDefault"
                    values={{
                        nbsp: <>&nbsp;</>,
                    }}
                />
            </div>
            <hr className="gd-separator-generic" />
        </div>
    );
}
