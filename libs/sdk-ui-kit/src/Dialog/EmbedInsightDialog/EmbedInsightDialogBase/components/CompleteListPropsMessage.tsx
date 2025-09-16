// (C) 2022-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

export interface ICompleteListPropsMessageProps {
    documentationLink: string;
}

export function CompleteListPropsMessage({ documentationLink }: ICompleteListPropsMessageProps) {
    return (
        <div className="embed-insight-dialog-list-props-message">
            <span className="gd-icon-circle-question s-circle_question question-mark-icon" />
            <a href={documentationLink} className="gd-button-link-dimmed" target="_blank" rel="noreferrer">
                <FormattedMessage id="embedInsightDialog.complete.list.props.message" />
            </a>
        </div>
    );
}
