// (C) 2007-2025 GoodData Corporation
import React from "react";
import reject from "lodash/reject.js";
import keys from "lodash/keys.js";
import { v4 as uuid } from "uuid";
import { Button, Messages, Message, IMessage } from "@gooddata/sdk-ui-kit";
import { wrapWithTheme } from "../../themeWrapper.js";

import { withIntl } from "@gooddata/sdk-ui";

const info: { guidelines: { name: string }[]; messages: Record<string, IMessage> } = {
    guidelines: [
        { name: "1-progress.png" },
        { name: "2-success.png" },
        { name: "3-failed.png" },
        { name: "4-warning.png" },
        { name: "5-construction.png" },
        { name: "6-message.png" },
        { name: "7-mobile.png" },
    ],
    messages: {
        success: {
            type: "success",
            text: "Course laid in!",
        } as IMessage,
        error: {
            type: "error",
            text: "We require more Vespene gas!",
        } as IMessage,
        progress: {
            type: "progress",
            text: "Slurping hagrilly up the axlegrurts...",
        } as IMessage,
        warning: {
            type: "warning",
            text: "Warning...",
        } as IMessage,
        custom: {
            type: "error",
            text: "Failed to do something. <strong>Please try again later.</strong>",
        } as IMessage,
        customNode: {
            type: "error",
            node: (
                <span>
                    This is error content as <b>JSX element</b>.
                </span>
            ),
        } as IMessage,
        successNode: {
            type: "success",
            node: (
                <span>
                    This is success content as <b>JSX element</b>.
                </span>
            ),
        } as IMessage,
    },
};

interface IMessagesExamplesState {
    messages: Array<IMessage>;
}

class MessagesExamples extends React.Component<unknown, IMessagesExamplesState> {
    constructor() {
        super({});

        this.state = {
            messages: [],
        };
    }

    private addMessage(message: IMessage) {
        let newMessages = [...this.state.messages];

        if (["error", "warning"].includes(message.type)) {
            newMessages = [
                ...newMessages,
                {
                    ...message,
                    id: new Date().getTime().toString(),
                    showMore: "Show more",
                    showLess: "Show less",
                    errorDetail:
                        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                },
            ];
        } else {
            newMessages = [
                ...newMessages,
                {
                    ...message,
                    id: new Date().getTime().toString(),
                },
            ];
        }

        document.querySelectorAll(".gd-messages").forEach((m: any) => {
            m.style.zIndex = 10001;
        });

        this.setState({ messages: newMessages });
    }

    private messageHidden = (messageId: string) => {
        const newMessages = reject(this.state.messages, (message) => message.id === messageId);

        this.setState({ messages: newMessages });
    };

    public render() {
        const buttons = keys(info.messages).map((msgName) => {
            const message = info.messages[msgName];
            return (
                <Button
                    key={`msg-${uuid()}`}
                    className="gd-button-primary"
                    value={`Add ${msgName}`}
                    onClick={() => this.addMessage(message)}
                />
            );
        });

        return (
            <div className={"library-component screenshot-target"}>
                <Message type="progress">This is progress message</Message>

                <br />

                <Message type="error">
                    <strong>Failed to do something.</strong> Please try again later. The server has not found
                    anything matching the Request-URI. No indication is given of whether the condition is
                    temporary or permanent. We&apos;ve been notified about this problem and will resolve it as
                    soon as possible.
                </Message>

                <br />

                <Message type="warning">This is warning message</Message>

                <br />

                <Message type="success">This is success message</Message>

                <br />

                <Messages onMessageClose={this.messageHidden} messages={this.state.messages} />

                {buttons}
            </div>
        );
    }
}

const WithIntl = withIntl(MessagesExamples);

export default {
    title: "12 UI Kit/Messages",
};

export const FullFeatured = () => <WithIntl />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };

export const Themed = () => wrapWithTheme(<WithIntl />);
Themed.parameters = { kind: "themed", screenshot: true };
