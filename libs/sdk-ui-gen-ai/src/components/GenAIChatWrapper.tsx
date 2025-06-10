// (C) 2024-2025 GoodData Corporation
import React from "react";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { Typography } from "@gooddata/sdk-ui-kit";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { FormattedMessage } from "react-intl";
import { connect } from "react-redux";
import { loadThreadAction, cancelAsyncAction } from "../store/index.js";
import { useConfig } from "./ConfigContext.js";

type GenAIChatWrapperProps = {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    autofocus?: boolean;
    initializing?: boolean;
};

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
const GenAIChatWrapperComponent: React.FC<GenAIChatWrapperProps> = ({
    loadThread,
    cancelLoading,
    autofocus,
    initializing,
}) => {
    const { catalogItems, canManage, canAnalyze } = useConfig();

    React.useEffect(() => {
        if (initializing) {
            return;
        }
        loadThread();

        return () => {
            cancelLoading();
        };
    }, [loadThread, cancelLoading, initializing]);

    return (
        <ErrorBoundary>
            <div className="gd-gen-ai-chat">
                <Messages />
                <Input
                    autofocus={autofocus}
                    catalogItems={catalogItems}
                    canManage={canManage}
                    canAnalyze={canAnalyze}
                />
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
