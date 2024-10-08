// (C) 2024 GoodData Corporation
import React from "react";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import { loadThreadAction, cancelAsyncAction } from "../store/index.js";

type GenAIChatWrapperProps = {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
};

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
const GenAIChatWrapperComponent: React.FC<GenAIChatWrapperProps> = ({ loadThread, cancelLoading }) => {
    React.useEffect(() => {
        loadThread();

        return () => {
            cancelLoading();
        };
    }, [loadThread, cancelLoading]);

    return (
        <ErrorBoundary>
            <div className="gd-gen-ai-chat">
                <Messages />
                <Input />
                <Typography tagName="p" className="gd-gen-ai-chat__disclaimer">
                    <FormattedMessage id="gd.gen-ai.disclaimer" />
                </Typography>
            </div>
        </ErrorBoundary>
    );
};

const mapDispatchToProps = {
    loadThread: loadThreadAction,
    cancelLoading: cancelAsyncAction,
};

export const GenAIChatWrapper = connect(null, mapDispatchToProps)(GenAIChatWrapperComponent);
