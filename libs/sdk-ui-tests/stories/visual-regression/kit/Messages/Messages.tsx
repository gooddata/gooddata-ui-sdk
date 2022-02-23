// (C) 2007-2020 GoodData Corporation
import React from "react";
import reject from "lodash/reject";
import keys from "lodash/keys";
import { v4 as uuid } from "uuid";
import { Button, Messages, Message, IMessage, MessageType } from "@gooddata/sdk-ui-kit";
import { wrapWithTheme } from "../../themeWrapper";

import { storiesOf } from "../../../_infra/storyRepository";
import { UiKit } from "../../../_infra/storyGroups";

const info = {
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
        success: "Course laid in!",
        error: "We require more Vespene gas!",
        progress: "Slurping hagrilly up the axlegrurts...",
        warning: "Warning...",
        custom: "Failed to do something. <strong>Please try again later.</strong>",
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

    private addMessage(type: MessageType) {
        const texts = info.messages;
        let newMessages = [...this.state.messages];

        if (["error", "warning"].includes(type)) {
            newMessages = [
                ...newMessages,
                {
                    id: new Date().getTime().toString(),
                    type,
                    text: texts[type],
                    showMore: "Show More",
                    showLess: "Show Less",
                    errorDetail:
                        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                },
            ];
        } else {
            newMessages = [
                ...newMessages,
                {
                    id: new Date().getTime().toString(),
                    type,
                    text: texts[type],
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
        const buttons = keys(info.messages).map((type) => {
            return (
                <Button
                    key={`msg-${uuid()}`}
                    className="gd-button-primary"
                    value={`Add ${type}`}
                    onClick={() => {
                        this.addMessage(type as MessageType);
                    }}
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

storiesOf(`${UiKit}/Messages`)
    .add("full-featured", () => <MessagesExamples />, { screenshot: true })
    .add("themed", () => wrapWithTheme(<MessagesExamples />), { screenshot: true });
