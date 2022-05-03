// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";

export interface ICompleteListPropsMessageProps {
    documentationLink: string;
}

export const CompleteListPropsMessage: React.VFC<ICompleteListPropsMessageProps> = (props) => {
    const { documentationLink } = props;

    return (
        <div className="embed-insight-dialog-list-props-message">
            <span className="gd-icon-circle-question s-circle_question toggle-switch-icon" />
            <a href={documentationLink} className="gd-button-link-dimmed" target="_blank" rel="noreferrer">
                <FormattedMessage id="embedInsightDialog.complete.list.props.message" />
            </a>
        </div>
    );
};
