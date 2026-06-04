// (C) 2024-2026 GoodData Corporation

import { type FC, useCallback } from "react";

import cx from "classnames";
import noop from "lodash-es/noop.js";
import { connect } from "react-redux";

import { type IUserWorkspaceSettings } from "@gooddata/sdk-model";
import { BackendProvider, WorkspaceProvider, useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { IntlWrapper } from "../localization/IntlWrapper.js";
import { type IChatConversationLocal } from "../model.js";
import { PermissionsProvider } from "../permissions/PermissionsContext.js";
import { usePermissions } from "../permissions/usePermissions.js";
import { settingsSelector } from "../store/chatWindow/chatWindowSelectors.js";
import {
    cancelAsyncAction,
    loadThreadAction,
    setCurrentConversationAction,
} from "../store/messages/messagesSlice.js";
import { type RootState } from "../store/types.js";

import { ConfigProvider } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import { GenAIChatConversations } from "./GenAIChatConversations.js";
import { GenAiStore, type GenAiStoreProps } from "./GenAiStore.js";
import { useThreadLoading } from "./hooks/useThreadLoading.js";

/**
 * Properties for the GenAIConversations component.
 * @public
 */
export type GenAIConversationsProps = Omit<GenAiStoreProps, "children"> & {
    /**
     * The locale to use for the chat UI.
     */
    locale?: string;
    /**
     * When provided, the function will be called when a conversation is selected.
     * The function will be called with the selected conversation.
     */
    onConversationSelect?: (conversation: IChatConversationLocal) => void;
    /**
     * Additional class name applied to the root element.
     */
    className?: string;
};

/**
 * UI component that renders the Gen AI assistant.
 * @public
 */
export function GenAIConversations(props: GenAIConversationsProps) {
    const {
        backend,
        workspace,
        locale,
        eventHandlers,
        settings,
        catalogItems,
        onDispatcher,
        isPreview,
        objectTypes,
        includeTags,
        excludeTags,
        colorPalette,
        providedStore,
    } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    return (
        <IntlWrapper locale={locale}>
            <GenAiStore
                providedStore={providedStore}
                backend={effectiveBackend}
                workspace={effectiveWorkspace}
                onDispatcher={onDispatcher}
                eventHandlers={eventHandlers}
                settings={settings}
                catalogItems={catalogItems}
                isPreview={isPreview}
                excludeTags={excludeTags}
                includeTags={includeTags}
                colorPalette={colorPalette}
                objectTypes={objectTypes}
            >
                <BackendProvider backend={effectiveBackend}>
                    <WorkspaceProvider workspace={effectiveWorkspace}>
                        <PermissionsProvider>
                            <GenAIConversationsContent {...props} />
                        </PermissionsProvider>
                    </WorkspaceProvider>
                </BackendProvider>
            </GenAiStore>
        </IntlWrapper>
    );
}

type GenAIConversationsWrapperProps = GenAIConversationsProps & {
    loadThread: typeof loadThreadAction;
    cancelLoading: typeof cancelAsyncAction;
    loadConversation: typeof setCurrentConversationAction;
    settings?: IUserWorkspaceSettings;
};

const mapDispatchToProps = {
    loadConversation: setCurrentConversationAction,
    loadThread: loadThreadAction,
    cancelLoading: cancelAsyncAction,
};

const mapStateToProps = (state: RootState) => ({
    settings: settingsSelector(state),
});

const GenAIConversationsContent: FC<GenAIConversationsProps> = connect(
    mapStateToProps,
    mapDispatchToProps,
)(function GenAIConversationsContent(props: GenAIConversationsWrapperProps) {
    const {
        catalogItems,
        className,
        onConversationSelect = noop,
        loadThread,
        cancelLoading,
        loadConversation,
        settings,
    } = props;
    const { loading } = usePermissions();

    const classNames = cx("gd-gen-ai-chat__embed__conversations", className);

    useThreadLoading({
        initializing: loading || !settings,
        loadThread,
        cancelLoading,
    });

    const onSelectConversation = useCallback(
        (conversation: IChatConversationLocal) => {
            loadConversation({ conversation });
            onConversationSelect(conversation);
        },
        [loadConversation, onConversationSelect],
    );

    return (
        <ConfigProvider
            catalogItems={catalogItems}
            allowNativeLinks={false}
            canFullControl={false}
            canManage={false}
            canAnalyze={false}
        >
            <CustomizationProvider>
                <GenAIChatConversations
                    wrapper={<div className={classNames} />}
                    onSelect={onSelectConversation}
                />
            </CustomizationProvider>
        </ConfigProvider>
    );
});
