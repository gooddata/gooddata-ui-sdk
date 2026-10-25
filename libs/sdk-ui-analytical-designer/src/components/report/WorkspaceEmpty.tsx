// (C) 2007-2026 GoodData Corporation

import { FormattedMessage, defineMessage } from "react-intl";
import { useSelector } from "react-redux";

import { getLinkToLoadDataPage } from "../../selectors/data_page_selector.js";
import { isFreemiumEdition } from "../../selectors/feature_flag_selector.js";
import { canManageProject } from "../../selectors/permissions_selector.js";
import { type IAppState } from "../../store/types.js";

import { ReportMessage } from "./ReportMessage.js";

interface IFreemiumMessageProps {
    isFreemiumEdition: boolean;
    linkToLoadDataPage: string;
}

function FreemiumMessage({ linkToLoadDataPage, isFreemiumEdition }: IFreemiumMessageProps) {
    return isFreemiumEdition ? (
        <span className="s-workspace-empty-data-load-link">
            <FormattedMessage
                id="dashboard.message.workspace_empty.description_link"
                values={{
                    dataLoadLink: (chunks) => (
                        <a href={linkToLoadDataPage} rel="noopener noreferrer" target="_blank">
                            {chunks}
                        </a>
                    ),
                }}
            />
        </span>
    ) : (
        <span className="s-workspace-empty-data-load">
            <FormattedMessage id="dashboard.message.workspace_empty.description_question" />
        </span>
    );
}

export function WorkspaceEmpty() {
    const linkToLoadDataPage = useSelector((state: IAppState) => getLinkToLoadDataPage(state));
    const isFreemium = useSelector((state: IAppState) => isFreemiumEdition(state));
    const canManage = useSelector((state: IAppState) => canManageProject(state));

    return (
        <ReportMessage
            headerMessageId={defineMessage({ id: "dashboard.message.workspace_empty.header" }).id}
            className="adi-canvas-message-workspace-empty-result s-error-workspace-empty-result s-report-message-type-workspace_empty"
        >
            {canManage ? (
                <FreemiumMessage isFreemiumEdition={isFreemium} linkToLoadDataPage={linkToLoadDataPage} />
            ) : (
                <span className="s-workspace-empty">
                    <FormattedMessage id="dashboard.message.workspace_empty.description" />
                </span>
            )}
        </ReportMessage>
    );
}
