// (C) 2024-2025 GoodData Corporation
import React, { useCallback } from "react";

import { FormattedMessage, useIntl } from "react-intl";
import { connect } from "react-redux";

import { useWorkspaceStrict } from "@gooddata/sdk-ui";
import { Button, Typography, UiNavigationBypass, useKeyboardNavigationTarget } from "@gooddata/sdk-ui-kit";

import { useConfig } from "./ConfigContext.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { GlobalError } from "./GlobalError.js";
import { useEndpointCheck } from "./hooks/useEndpointCheck.js";
import { useThreadLoading } from "./hooks/useThreadLoading.js";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";
import {
    RootState,
    asyncProcessSelector,
    cancelAsyncAction,
    clearThreadAction,
    loadThreadAction,
} from "../store/index.js";
import { getAbsoluteSettingHref, getSettingHref } from "../utils.js";

export type GenAIChatOwnProps = {
    autofocus?: boolean;
    initializing?: boolean;
};

type GenAIChatWrapperProps = GenAIChatOwnProps & {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    clearThread: typeof clearThreadAction;
    autofocus?: boolean;
    initializing?: boolean;
    isClearing?: boolean;
};

const GEN_AI_SECTION = "ai";
const CREATE_LLM_PROVIDER_ACTION = "create-llm-provider";
const GEN_AI_INPUT_ANCHOR_ID = "gd-gen-ai-input";

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
function GenAIChatWrapperComponent({
    loadThread,
    clearThread,
    cancelLoading,
    autofocus,
    initializing,
    isClearing,
}: GenAIChatWrapperProps) {
    const intl = useIntl();
    const workspaceId = useWorkspaceStrict();
    const { linkHandler, allowNativeLinks, catalogItems, canManage, canAnalyze, canFullControl } =
        useConfig();
    const { checking, evaluated, count, restart } = useEndpointCheck(canFullControl);

    useThreadLoading({
        initializing: initializing || checking,
        loadThread,
        cancelLoading,
    });

    const { targetRef } = useKeyboardNavigationTarget({
        navigationId: GEN_AI_INPUT_ANCHOR_ID,
        tabIndex: -1,
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
                <NavigationBypass />
                <Messages />
                <Input
                    targetRef={targetRef}
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
}

function NavigationBypass() {
    const intl = useIntl();
    const bypassBlocks = [
        {
            id: "skip-to-ask-question",
            name: intl.formatMessage({ id: "gd.gen-ai.skip-messages-history" }),
            targetId: GEN_AI_INPUT_ANCHOR_ID,
        },
    ];
    return (
        <UiNavigationBypass
            label={intl.formatMessage({ id: "gd.gen-ai.skip-navigation" })}
            items={bypassBlocks}
        />
    );
}

const mapStateToProps = (state: RootState) => ({
    isClearing: asyncProcessSelector(state) === "clearing",
});

const mapDispatchToProps = {
    loadThread: loadThreadAction,
    cancelLoading: cancelAsyncAction,
    clearThread: clearThreadAction,
};

export const GenAIChatWrapper: React.FC<GenAIChatOwnProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(GenAIChatWrapperComponent);
