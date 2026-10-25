// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportExecuteProtected() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.execute_protected_report.header" }).id}
            className="s-error-execute-protected-report s-report-message-type-execute_protected_report"
        >
            <FormattedMessage id="dashboard.message.execute_protected_report.description" />
        </ReportMessage>
    );
}
