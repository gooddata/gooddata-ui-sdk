// (C) 2024-2025 GoodData Corporation
import React, { useCallback } from "react";
import { Button, Typography } from "@gooddata/sdk-ui-kit";
import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { getAbsoluteSettingHref, getSettingHref } from "../utils.js";
import {
    loadThreadAction,
    cancelAsyncAction,
    clearThreadAction,
    RootState,
    asyncProcessSelector,
} from "../store/index.js";

import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import { ErrorBoundary } from "./ErrorBoundary.js";

import { useConfig } from "./ConfigContext.js";
import { useThreadLoading } from "./hooks/useThreadLoading.js";
import { useEndpointCheck } from "./hooks/useEndpointCheck.js";
import { GlobalError } from "./GlobalError.js";

type GenAIChatWrapperOwnProps = {
    autofocus?: boolean;
    onFeedbackCallback?: () => void;
    feedbackAnimationComponent?: React.ComponentType<{
        onComplete: () => void;
        triggerElement?: HTMLElement | null;
    }>;
};

type GenAIChatWrapperProps = GenAIChatWrapperOwnProps & {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    clearThread: typeof clearThreadAction;
    initializing?: boolean;
    isClearing?: boolean;
};

const GEN_AI_SECTION = "ai";
const CREATE_LLM_PROVIDER_ACTION = "create-llm-provider";

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
const GenAIChatWrapperComponent: React.FC<GenAIChatWrapperProps> = ({
    loadThread,
    clearThread,
    cancelLoading,
    autofocus,
    initializing,
    isClearing,
    onFeedbackCallback,
    feedbackAnimationComponent,
}) => {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const { linkHandler, allowNativeLinks } = useConfig();
    const { catalogItems, canManage, canAnalyze, canFullControl } = useConfig();
    const { checking, evaluated, count, restart } = useEndpointCheck(canFullControl);

    useThreadLoading({
        initializing: initializing || checking,
        loadThread,
        cancelLoading,
    });

    const onSettingClick = useCallback(
        (e: React.MouseEvent) => {
            if (allowNativeLinks) {
                window.location.href = getAbsoluteSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION);
            } else {
                linkHandler?.({
                    id: CREATE_LLM_PROVIDER_ACTION,
                    workspaceId,
                    type: "setting",
                    newTab: e.metaKey,
                    section: GEN_AI_SECTION,
                    preventDefault: e.preventDefault.bind(e),
                    itemUrl: getSettingHref(GEN_AI_SECTION, CREATE_LLM_PROVIDER_ACTION),
                });
                e.stopPropagation();
            }
        },
        [allowNativeLinks, linkHandler, workspaceId],
    );

    if (evaluated && count === 0) {
        return (
            <GlobalError
                errorMessage={intl.formatMessage({ id: "gd.gen-ai.global-no-llm" })}
                errorDescription={intl.formatMessage({ id: "gd.gen-ai.global-no-llm.description" })}
                clearError={() => {
                    clearThread();
                    restart();
                }}
                clearing={isClearing}
                buttonsBefore={
                    <>
                        <Button
                            className="gd-button-link"
                            value={intl.formatMessage({ id: "gd.gen-ai.global-no-llm.button-create-llm" })}
                            onClick={onSettingClick}
                        />
                    </>
                }
            />
        );
    }

    return (
        <ErrorBoundary>
            <div className="gd-gen-ai-chat">
                <Messages
                    onFeedbackCallback={onFeedbackCallback}
                    feedbackAnimationComponent={feedbackAnimationComponent}
                />
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

const mapStateToProps = (state: RootState) => ({
    isClearing: asyncProcessSelector(state) === "clearing",
});

const mapDispatchToProps = {
    loadThread: loadThreadAction,
    cancelLoading: cancelAsyncAction,
    clearThread: clearThreadAction,
};

export const GenAIChatWrapper = connect(mapStateToProps, mapDispatchToProps)(GenAIChatWrapperComponent);
