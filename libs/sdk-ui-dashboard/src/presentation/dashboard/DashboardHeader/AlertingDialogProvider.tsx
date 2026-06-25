// (C) 2022-2026 GoodData Corporation

import {
    AlertingAutomationsProvider,
    AlertingConnector,
} from "../../automations/connectors/AlertingConnector.js";

export function AlertingDialogProvider() {
    return (
        <AlertingAutomationsProvider>
            <AlertingConnector />
        </AlertingAutomationsProvider>
    );
}
