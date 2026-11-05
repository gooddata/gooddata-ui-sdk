// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import { canManageProject } from "../../selectors/permissions_selector.js";
import { type IAppState } from "../../store/types.js";

import { ReportMessage } from "./ReportMessage.js";

export function WorkspaceEmpty() {
    const canManage = useSelector((state: IAppState) => canManageProject(state));

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.workspace_empty.header" }).id}
            className="adi-canvas-message-workspace-empty-result s-error-workspace-empty-result s-report-message-type-workspace_empty"
        >
            {canManage ? (
                <span className="s-workspace-empty-data-load">
                    <FormattedMessage id="dashboard.message.workspace_empty.description_question" />
                </span>
            ) : (
                <span className="s-workspace-empty">
                    <FormattedMessage id="dashboard.message.workspace_empty.description" />
                </span>
            )}
        </ReportMessage>
    );
}
