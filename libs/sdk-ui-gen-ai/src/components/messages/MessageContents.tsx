// (C) 2024 GoodData Corporation

import React from "react";
import Skeleton from "react-loading-skeleton";
import { Contents } from "../../model.js";
import { TextContentsComponent } from "./contents/TextContents.js";
import { ErrorContentsComponent } from "./contents/ErrorContents.js";
import { RoutingContentsComponent } from "./contents/RoutingContents.js";
import { SearchContentsComponent } from "./contents/SearchContents.js";
import { VisualizationContentsComponent } from "./contents/VisualizationContents.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { FormattedMessage } from "react-intl";

type MessageContentsProps = {
    content: Contents[];
    isComplete?: boolean;
    isCancelled?: boolean;
};

export const MessageContents: React.FC<MessageContentsProps> = ({
    content,
    isComplete = true,
    isCancelled = false,
}) => {
    return (
        <div className="gd-gen-ai-chat__messages__contents">
            {content.map((item, index) => {
                const type = item.type;
                switch (type) {
                    case "text":
                        return <TextContentsComponent content={item} key={index} />;
                    case "error":
                        return <ErrorContentsComponent content={item} key={index} />;
                    case "routing":
                        return <RoutingContentsComponent content={item} key={index} />;
                    case "search":
                        return <SearchContentsComponent content={item} key={index} />;
                    case "visualization":
                        return <VisualizationContentsComponent content={item} key={index} />;
                    default:
                        return assertNever(type);
                }
            })}
            {!isComplete ? <Skeleton /> : null}
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
