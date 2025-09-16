// (C) 2022-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";
export function DateDatasetDuplicityWarning() {
    return (
        <div className="gd-message warning s-date-dataset-duplicity-warning">
            <div className="gd-message-text">
                <FormattedMessage id="gs.date.date-dataset.duplicityWarning" />
            </div>
        </div>
    );
}
