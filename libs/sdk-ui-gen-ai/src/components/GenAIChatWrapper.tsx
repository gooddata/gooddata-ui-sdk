// (C) 2024-2026 GoodData Corporation

import { useCallback, useEffect } from "react";

import cx from "classnames";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-backend-spi";
import { Button, UiNavigationBypass, useKeyboardNavigationTarget } from "@gooddata/sdk-ui-kit";

import { ALLOWED_RELATIONSHIP_TYPES_FOR_VIEWER } from "../store/chatWindow/allowedRelationshipTypes.js";
import { settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import { setAllowedRelationshipTypesAction } from "../store/chatWindow/chatWindowSlice.js";
import { asyncProcessSelector } from "../store/messages/messagesSelectors.js";
import { cancelAsyncAction, clearThreadAction, loadThreadAction } from "../store/messages/messagesSlice.js";

import { useConfig } from "./ConfigContext.js";
import { useCustomization } from "./CustomizationProvider.js";
import { ErrorBoundary } from "./ErrorBoundary.js";
import { GlobalError } from "./GlobalError.js";
import { useEndpointCheck } from "./hooks/useEndpointCheck.js";
import { useSettingsClick } from "./hooks/useSettingsClick.js";
import { useThreadLoading } from "./hooks/useThreadLoading.js";
import { Input } from "./Input.js";
import { Messages } from "./Messages.js";

export type GenAIChatOwnProps = {
    autofocus?: boolean;
    initializing?: boolean;
    className?: string;
};

export type GenAIChatWrapperProps = GenAIChatOwnProps & {
    loadThread: (...args: Parameters<typeof loadThreadAction>) => void;
    cancelLoading: (...args: Parameters<typeof cancelAsyncAction>) => void;
    clearThread: (...args: Parameters<typeof clearThreadAction>) => void;
    setAllowedRelationshipTypes: (...args: Parameters<typeof setAllowedRelationshipTypesAction>) => void;
    autofocus?: boolean;
    initializing?: boolean;
    isClearing?: boolean;
    settings?: IUserWorkspaceSettings;
};

const GEN_AI_INPUT_ANCHOR_ID = "gd-gen-ai-input";

/**
 * UI component that renders the Gen AI chat.
 * @internal
 */
function GenAIChatWrapperComponent({
    loadThread,
    clearThread,
    cancelLoading,
    setAllowedRelationshipTypes,
    autofocus,
    initializing,
    isClearing,
    settings,
    className,
}: GenAIChatWrapperProps) {
    const intl = useIntl();
    const { canManage, canAnalyze, canFullControl } = useConfig();
    const { DisclaimerComponent } = useCustomization();
    const { checking, evaluated, count, hasUnsupportedOpenAiModel, restart } = useEndpointCheck(
        settings,
        canFullControl,
    );

    const canEdit = canFullControl || canManage || canAnalyze;
    const allowedRelationshipTypes = canEdit ? undefined : ALLOWED_RELATIONSHIP_TYPES_FOR_VIEWER;
    useEffect(() => {
        setAllowedRelationshipTypes({ allowedRelationshipTypes });
    }, [setAllowedRelationshipTypes, allowedRelationshipTypes]);

    useThreadLoading({
        initializing: initializing || checking,
        loadThread,
        cancelLoading,
    });

    const { targetRef } = useKeyboardNavigationTarget({
        navigationId: GEN_AI_INPUT_ANCHOR_ID,
        tabIndex: -1,
    });

    const onSettingClick = useSettingsClick(settings);

    if (evaluated && hasUnsupportedOpenAiModel) {
        return (
            <GlobalError
                errorMessage={intl.formatMessage({ id: "gd.gen-ai.global-unsupported-model" })}
                errorDescription={intl.formatMessage({
                    id: "gd.gen-ai.global-unsupported-model.description",
                })}
                clearError={() => {
                    clearThread();
                    restart();
                }}
                clearing={isClearing}
                buttonsBefore={
                    <>
                        <Button
                            className="gd-button-link"
                            value={intl.formatMessage({
                                id: "gd.gen-ai.global-unsupported-model.button-change-model",
                            })}
                            onClick={onSettingClick("change-model")}
                        />
                    </>
                }
            />
        );
    }

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
                            onClick={onSettingClick("create")}
                        />
                    </>
                }
            />
        );
    }

    return (
        <ErrorBoundary>
            <div className={cx("gd-gen-ai-chat", className)}>
                <NavigationBypass />
                <Messages />
                <Input
                    targetRef={targetRef}
                    autofocus={autofocus}
                    canManage={canManage}
                    canAnalyze={canAnalyze}
                />
                {DisclaimerComponent ? <DisclaimerComponent /> : null}
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

export function GenAIChatWrapper(ownProps: GenAIChatOwnProps) {
    const isClearing = useSelector(asyncProcessSelector) === "clearing";
    const settings = useSelector(settingsSelector);

    const dispatch = useDispatch();
    const loadThread = useCallback(
        (...args: Parameters<typeof loadThreadAction>) => {
            dispatch(loadThreadAction(...args));
        },
        [dispatch],
    );
    const cancelLoading = useCallback(
        (...args: Parameters<typeof cancelAsyncAction>) => {
            dispatch(cancelAsyncAction(...args));
        },
        [dispatch],
    );
    const clearThread = useCallback(
        (...args: Parameters<typeof clearThreadAction>) => {
            dispatch(clearThreadAction(...args));
        },
        [dispatch],
    );
    const setAllowedRelationshipTypes = useCallback(
        (...args: Parameters<typeof setAllowedRelationshipTypesAction>) => {
            dispatch(setAllowedRelationshipTypesAction(...args));
        },
        [dispatch],
    );

    return (
        <GenAIChatWrapperComponent
            {...ownProps}
            isClearing={isClearing}
            settings={settings}
            loadThread={loadThread}
            cancelLoading={cancelLoading}
            clearThread={clearThread}
            setAllowedRelationshipTypes={setAllowedRelationshipTypes}
        />
    );
}
