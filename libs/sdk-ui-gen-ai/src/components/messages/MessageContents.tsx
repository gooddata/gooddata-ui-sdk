// (C) 2024-2025 GoodData Corporation

import React from "react";
import { Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

import { Contents } from "../../model.js";
import { TextContentsComponent } from "./contents/TextContents.js";
import { ErrorContentsComponent } from "./contents/ErrorContents.js";
import { RoutingContentsComponent } from "./contents/RoutingContents.js";
import { SearchContentsComponent } from "./contents/SearchContents.js";
import { VisualizationContentsComponent } from "./contents/VisualizationContents.js";

type MessageContentsProps = {
    content: Contents[];
    messageId: string;
    isComplete?: boolean;
    isCancelled?: boolean;
    isLastMessage?: boolean;
    useMarkdown?: boolean;
};

export const MessageContents: React.FC<MessageContentsProps> = ({
    content,
    messageId,
    isComplete = true,
    isCancelled = false,
    isLastMessage = false,
    useMarkdown = false,
}) => {
    return (
        <div className="gd-gen-ai-chat__messages__contents">
            {content.map((item, index) => {
                const type = item.type;
                switch (type) {
                    case "text":
                        return <TextContentsComponent useMarkdown={useMarkdown} content={item} key={index} />;
                    case "error":
                        return (
                            <ErrorContentsComponent useMarkdown={useMarkdown} content={item} key={index} />
                        );
                    case "routing":
                        return (
                            <RoutingContentsComponent useMarkdown={useMarkdown} content={item} key={index} />
                        );
                    case "search":
                        return (
                            <SearchContentsComponent useMarkdown={useMarkdown} content={item} key={index} />
                        );
                    case "visualization":
                        return (
                            <VisualizationContentsComponent
                                useMarkdown={useMarkdown}
                                content={item}
                                key={index}
                                showSuggestions={isLastMessage}
                                messageId={messageId}
                            />
                        );
                    default:
                        return assertNever(type);
                }
            })}
            {!isComplete ? (
                <Typography tagName="p">
                    <FormattedMessage id="gd.gen-ai.state.generating" />
                </Typography>
            ) : null}
            {isCancelled ? (
                <Typography tagName="p">
                    <FormattedMessage id="gd.gen-ai.state.cancelled" />
                </Typography>
            ) : null}
        </div>
    );
};

const assertNever = (value: never): never => {
    throw new Error(`Unknown content type: ${value}`);
};
