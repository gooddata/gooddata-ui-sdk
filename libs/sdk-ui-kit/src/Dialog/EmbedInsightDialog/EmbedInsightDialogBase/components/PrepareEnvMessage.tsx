// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "../../../../Messages";

export interface IPrepareEnvMessageProps {
    integrationDocLink: string;
}

export const PrepareEnvMessage: React.VFC<IPrepareEnvMessageProps> = (props) => {
    const { integrationDocLink } = props;

    if (integrationDocLink) {
        return (
            <Message type="progress" className="embed-insight-dialog-prep-env-message">
                <span>
                    <FormattedMessage
                        id="embedInsightDialog.prepareEnvironmentMessage"
                        values={{ b: (chunks: string) => <strong>{chunks}</strong> }}
                    />
                </span>
                <a href={integrationDocLink} target="_blank" rel="noreferrer">
                    <FormattedMessage id="embedInsightDialog.prepareEnvironmentMessage.link" />
                </a>
            </Message>
        );
    }

    return null;
};
