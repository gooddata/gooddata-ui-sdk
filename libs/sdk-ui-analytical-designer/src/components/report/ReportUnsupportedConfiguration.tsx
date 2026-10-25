// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";

import { ReportMessage } from "./ReportMessage.js";

export function ReportUnsupportedConfiguration() {
    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.unsupported_config.header" }).id}
            className="s-error-unsupported-configuration s-report-message-type-unsupported_config"
        >
            <FormattedMessage id="dashboard.message.unsupported_config.description" />
        </ReportMessage>
    );
}
