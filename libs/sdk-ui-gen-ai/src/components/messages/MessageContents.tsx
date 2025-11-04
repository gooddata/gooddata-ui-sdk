// (C) 2024-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { Typography } from "@gooddata/sdk-ui-kit";

import { ChangeAnalysisContentsComponent } from "./contents/ChangeAnalysisContentsComponent.js";
import { ErrorContentsComponent } from "./contents/ErrorContents.js";
import { RoutingContentsComponent } from "./contents/RoutingContents.js";
import { SearchContentsComponent } from "./contents/SearchContents.js";
import { TextContentsComponent } from "./contents/TextContents.js";
import { VisualizationContentsComponent } from "./contents/VisualizationContents.js";
import { Contents } from "../../model.js";

type MessageContentsProps = {
    content: Contents[];
    messageId: string;
    isComplete?: boolean;
    isCancelled?: boolean;
    isLastMessage?: boolean;
    useMarkdown?: boolean;
};

export function MessageContents({
    content,
    messageId,
    isComplete = true,
    isCancelled = false,
    isLastMessage = false,
    useMarkdown = false,
}: MessageContentsProps) {
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
                    case "changeAnalysis":
                        return (
                            <ChangeAnalysisContentsComponent
                                useMarkdown={useMarkdown}
                                content={item}
                                key={index}
                                messageId={messageId}
                            />
                        );
                    default:
                        return assertNever(type);
                }
            })}
            {isComplete ? null : (
                <Typography tagName="p">
                    <FormattedMessage id="gd.gen-ai.state.generating" />
                </Typography>
            )}
            {isCancelled ? (
                <Typography tagName="p">
                    <FormattedMessage id="gd.gen-ai.state.cancelled" />
                </Typography>
            ) : null}
        </div>
    );
}

const assertNever = (value: never): never => {
    throw new Error(`Unknown content type: ${value}`);
};
