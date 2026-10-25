// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportEmpty() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.empty.header" }).id}
            className="adi-canvas-message-empty-result s-error-empty-result s-report-message-type-empty"
        >
            <FormattedMessage id="dashboard.message.empty.description" />
        </ReportMessage>
    );
}
