// (C) 2020-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportMissingLocation() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.missing_location.header" }).id}
            className="adi-canvas-message-missing-location s-error-missing-location s-report-message-type-missing_location"
        >
            <FormattedMessage
                id="dashboard.message.missing_location.description"
                values={{
                    br: <br />,
                }}
            />
        </ReportMessage>
    );
}
