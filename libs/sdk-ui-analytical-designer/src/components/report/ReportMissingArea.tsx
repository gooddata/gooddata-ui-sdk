// (C) 2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportMissingArea() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.missing_area.header" }).id}
            className="adi-canvas-message-missing-area s-error-missing-area s-report-message-type-missing_area"
        >
            <FormattedMessage
                id="dashboard.message.missing_area.description"
                values={{
                    br: <br />,
                }}
            />
        </ReportMessage>
    );
}
