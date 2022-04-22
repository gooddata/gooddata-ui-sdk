// (C) 2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { Message } from "../../../../Messages";

export interface IPrepareEnvMessageProps {
    isTiger: boolean;
}

const bearLink = "https://sdk.gooddata.com/gooddata-ui/docs/platform_integration.html";
const tigerLink = "https://sdk.gooddata.com/gooddata-ui/docs/cloudnative_integration.html";

export const PrepareEnvMessage: React.VFC<IPrepareEnvMessageProps> = (props) => {
    const { isTiger } = props;

    const link = isTiger ? tigerLink : bearLink;

    return (
        <Message type="progress" className="embed-insight-dialog-prep-env-message">
            <span>
                <FormattedMessage
                    id="embedInsightDialog.prepareEnvironmentMessage"
                    values={{ b: (chunks: string) => <strong>{chunks}</strong> }}
                />
            </span>
            <a href={link} target="_blank" rel="noreferrer">
                <FormattedMessage id="embedInsightDialog.prepareEnvironmentMessage.link" />
            </a>
        </Message>
    );
};
