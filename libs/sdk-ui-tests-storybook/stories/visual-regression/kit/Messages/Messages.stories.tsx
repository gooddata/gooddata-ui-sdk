// (C) 2007-2026 GoodData Corporation

import { useCallback } from "react";

import { v4 as uuid } from "uuid";

import { withIntl } from "@gooddata/sdk-ui";
import {
    Button,
    type IMessageDefinition,
    Message,
    ToastsCenter,
    ToastsCenterContext,
    useToastsCenterValue,
} from "@gooddata/sdk-ui-kit";

import { type IStoryParameters, State } from "../../../_infra/backstopScenario.js";
import { wrapWithTheme } from "../../themeWrapper.js";

const info = {
    guidelines: [
        { name: "1-progress.png" },
        { name: "2-success.png" },
        { name: "3-failed.png" },
        { name: "4-warning.png" },
        { name: "5-construction.png" },
        { name: "6-message.png" },
        { name: "7-mobile.png" },
    ] satisfies Array<{ name: string }>,
    messages: {
        success: {
            type: "success" as const,
            text: "Course laid in!",
        },
        error: {
            type: "error" as const,
            text: "We require more Vespene gas!",
        },
        progress: {
            type: "progress" as const,
            text: "Slurping hagrilly up the axlegrurts...",
        },
        warning: {
            type: "warning" as const,
            text: "Warning...",
        },
        custom: {
            type: "error" as const,
            text: "Failed to do something. <strong>Please try again later.</strong>",
        },
        customNode: {
            type: "error" as const,
            node: (
                <span>
                    This is error content as <b>JSX element</b>.
                </span>
            ),
        },
        successNode: {
            type: "success" as const,
            node: (
                <span>
                    This is success content as <b>JSX element</b>.
                </span>
            ),
        },
    } satisfies Record<string, IMessageDefinition>,
};

function MessagesExamples() {
    const toastsCenterValue = useToastsCenterValue();

    const addMessage = useCallback(
        (message: IMessageDefinition) => {
            if (["error", "warning"].includes(message.type)) {
                toastsCenterValue.addMessage({
                    ...message,
                    showMore: "Show more",
                    showLess: "Show less",
                    errorDetail:
                        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
                });
            } else {
                toastsCenterValue.addMessage(message);
            }
        },
        [toastsCenterValue],
    );

    const buttons = (Object.keys(info.messages) as Array<keyof (typeof info)["messages"]>).map((msgName) => {
        const message = info.messages[msgName];
        return (
            <Button
                key={`msg-${uuid()}`}
                className="gd-button-primary"
                value={`Add ${msgName}`}
                onClick={() => addMessage(message)}
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

            <ToastsCenterContext value={toastsCenterValue}>
                <ToastsCenter />
                {buttons}
            </ToastsCenterContext>
        </div>
    );
}

const WithIntl = withIntl(MessagesExamples);

export default {
    title: "12 UI Kit/Messages",
};

export function FullFeatured() {
    return <WithIntl />;
}
FullFeatured.parameters = {
    kind: "full-featured",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;

export const Themed = () => wrapWithTheme(<WithIntl />);
Themed.parameters = {
    kind: "themed",
    screenshot: { readySelector: { selector: ".screenshot-target", state: State.Attached } },
} satisfies IStoryParameters;
