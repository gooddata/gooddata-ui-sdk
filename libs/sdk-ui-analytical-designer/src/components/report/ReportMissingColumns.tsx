// (C) 2024-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportMissingColumns() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.missing_columns.header" }).id}
            className="adi-canvas-message-missing-columns s-error-missing-columns s-report-message-type-missing_columns"
        >
            <FormattedMessage
                id="dashboard.message.missing_columns.description"
                values={{
                    br: <br />,
                }}
            />
        </ReportMessage>
    );
}
