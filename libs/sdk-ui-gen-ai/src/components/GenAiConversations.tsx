// (C) 2024-2026 GoodData Corporation

import { useCallback } from "react";

import cx from "classnames";
import noop from "lodash-es/noop.js";
import { useDispatch, useSelector } from "react-redux";

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

import { ConfigProvider } from "./ConfigContext.js";
import { CustomizationProvider } from "./CustomizationProvider.js";
import type { IGenAIAssistantSlots } from "./customized/types.js";
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
    /**
     * Customizations for the Gen AI assistant.
     */
    slots?: IGenAIAssistantSlots;
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
        allowNativeLinks,
        onLinkClick,
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
                allowNativeLinks={allowNativeLinks}
                onLinkClick={onLinkClick}
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

function GenAIConversationsContent(props: GenAIConversationsProps) {
    const { catalogItems, className, onConversationSelect = noop, slots } = props;
    const dispatch = useDispatch();
    const settings = useSelector(settingsSelector);
    const { loading } = usePermissions();

    const classNames = cx("gd-gen-ai-chat__embed__conversations", className);

    const loadThread = useCallback(() => {
        dispatch(loadThreadAction());
    }, [dispatch]);

    const cancelLoading = useCallback(() => {
        dispatch(cancelAsyncAction());
    }, [dispatch]);

    useThreadLoading({
        initializing: loading || !settings,
        loadThread,
        cancelLoading,
    });

    const onSelectConversation = useCallback(
        (conversation: IChatConversationLocal) => {
            dispatch(setCurrentConversationAction({ conversation }));
            onConversationSelect(conversation);
        },
        [dispatch, onConversationSelect],
    );

    return (
        <ConfigProvider
            catalogItems={catalogItems}
            allowNativeLinks={false}
            canFullControl={false}
            canManage={false}
            canAnalyze={false}
        >
            <CustomizationProvider slots={slots}>
                <GenAIChatConversations
                    wrapper={<div className={classNames} />}
                    onSelect={onSelectConversation}
                />
            </CustomizationProvider>
        </ConfigProvider>
    );
}
