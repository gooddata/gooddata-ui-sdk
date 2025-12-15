// (C) 2024-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";

import { Typography } from "@gooddata/sdk-ui-kit";

import { ChangeAnalysisContentsComponent } from "./contents/ChangeAnalysisContentsComponent.js";
import { ErrorContentsComponent } from "./contents/ErrorContents.js";
import { RoutingContentsComponent } from "./contents/RoutingContents.js";
import { SearchContentsComponent } from "./contents/SearchContents.js";
import { SemanticSearchContentsComponent } from "./contents/SemanticSearchContents.js";
import { TextContentsComponent } from "./contents/TextContents.js";
import { VisualizationContentsComponent } from "./contents/VisualizationContents.js";
import { type AssistantMessageState } from "./messageState.js";
import { ReasoningMessage } from "./ReasoningMessage.js";
import { type Contents } from "../../model.js";
import { settingsSelector } from "../../store/chatWindow/chatWindowSelectors.js";

type MessageContentsProps = {
    content: Contents[];
    messageId: string;
    messageState?: AssistantMessageState;
    isLastMessage?: boolean;
    useMarkdown?: boolean;
};

export function MessageContents({
    content,
    messageId,
    messageState = "complete",
    isLastMessage = false,
    useMarkdown = false,
}: MessageContentsProps) {
    const settings = useSelector(settingsSelector);
    const isReasoningEnabled = Boolean(settings?.enableGenAIReasoningVisibility);

    const isComplete =
        messageState === "complete" || messageState === "cancelled" || messageState === "error";
    const isCancelled = messageState === "cancelled";

    return (
        <div className="gd-gen-ai-chat__messages__contents">
            {/* Show thought process dropdown during and after streaming */}
            <ReasoningMessage content={content} messageState={messageState} />

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
                        // Show routing when reasoning FF is disabled (original behavior)
                        return (
                            <RoutingContentsComponent
                                useMarkdown={useMarkdown}
                                content={item}
                                key={index}
                                isReasoningEnabled={isReasoningEnabled}
                            />
                        );
                    case "reasoning":
                        // Skip reasoning here - shown in dropdown when FF is enabled
                        return null;
                    case "search":
                        return (
                            <SearchContentsComponent useMarkdown={useMarkdown} content={item} key={index} />
                        );
                    case "semanticSearch":
                        return (
                            <SemanticSearchContentsComponent
                                key={index}
                                content={item}
                                useMarkdown={useMarkdown}
                            />
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
            {/* Show loading message when reasoning FF is disabled and still loading */}
            {!isReasoningEnabled && !isComplete ? (
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
}

const assertNever = (value: never): never => {
    throw new Error(`Unknown content type: ${value}`);
};
