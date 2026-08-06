// (C) 2026 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import type { EditorView } from "@codemirror/view";
import cx from "classnames";
import { defineMessages, useIntl } from "react-intl";

import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";
import { SyntaxHighlightingInput } from "@gooddata/sdk-ui-kit";

import { useGenAIStandaloneInputData } from "../hooks/useGenAIStandaloneInputData.js";
import { IntlWrapper } from "../localization/IntlWrapper.js";

import { useCompletion } from "./completion/useCompletion.js";
import { GenAiChatAgentSwitching } from "./GenAiChatAgentSwitching.js";
import { GenAiStore, type GenAiStoreProps } from "./GenAiStore.js";
import { useHighlight } from "./highlight/useHighlight.js";
import { useFullscreenCheck } from "./hooks/useFullscreenCheck.js";
import { useInputAutofocus } from "./hooks/useInputAutofocus.js";

const msgs = defineMessages({
    placeholder: {
        id: "gd.gen-ai.input-placeholder",
    },
});

/**
 * @internal
 */
export type GenAIStandaloneInputProps = Omit<GenAiStoreProps, "children"> & {
    /**
     * Callback called when the user submits a message.
     */
    onStart?: (prompt: string, agentId?: string) => void;
    /**
     * Callback called when the user sets an agent.
     */
    onAgentSet?: (agentId: string) => void;
    /**
     * Additional class name for the input container.
     */
    className?: string;
    /**
     * Whether the user has manage permissions.
     */
    canManage?: boolean;
    /**
     * Whether the user has analyze permissions.
     */
    canAnalyze?: boolean;
    /**
     * Locale for the component.
     */
    locale?: string;
    /**
     * Whether the input should autofocus.
     */
    autofocus?: boolean;
};

function StandaloneInputContent({
    onStart,
    onAgentSet,
    className,
    canManage,
    canAnalyze,
    autofocus = true,
}: Omit<GenAIStandaloneInputProps, keyof GenAiStoreProps>) {
    const intl = useIntl();
    const [value, setValue] = useState("");
    const [editorApi, setApi] = useState<EditorView | null>(null);
    const { selectedAgentId, agentSwitchingEnabled } = useGenAIStandaloneInputData();

    useEffect(() => {
        if (selectedAgentId) {
            onAgentSet?.(selectedAgentId);
        }
    }, [selectedAgentId, onAgentSet]);

    const { isFullscreen, isBigScreen, isSmallScreen } = useFullscreenCheck();

    const { onCompletion, used } = useCompletion([], { canManage, canAnalyze });
    const { highlightExtension, atomicCursorExtension } = useHighlight(used);

    const beforeExtensions = useMemo(() => [atomicCursorExtension], [atomicCursorExtension]);
    const extensions = useMemo(() => [highlightExtension], [highlightExtension]);

    // Force focus when autofocus is enables on the first mount, right after the initial state is loaded
    const ref = useInputAutofocus(editorApi, autofocus, { isBusy: false });

    const handleSubmit = useCallback(() => {
        const trimmed = value.trim();
        if (trimmed) {
            onStart?.(trimmed, selectedAgentId);
            setValue("");
        }
    }, [value, selectedAgentId, onStart]);

    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            const trimmed = value.trim();
            if (trimmed) {
                e.preventDefault();
                e.stopPropagation();
                handleSubmit();
                return true;
            }
        }
        return false;
    };

    return (
        <div
            className={cx("gd-gen-ai-chat__input", className, {
                "gd-gen-ai-chat__input--fullscreen": isFullscreen,
                "gd-gen-ai-chat__input--big-screen": isBigScreen,
                "gd-gen-ai-chat__input--small-screen": isSmallScreen,
                "gd-gen-ai-chat__input--agent-switching": agentSwitchingEnabled,
            })}
        >
            <div className="gd-gen-ai-chat__input__content">
                <div className="gd-gen-ai-chat__input__container">
                    <div className="gd-gen-ai-chat__input__text" {...ref}>
                        <SyntaxHighlightingInput
                            className="gd-gen-ai-chat__input__mc"
                            placeholder={intl.formatMessage(msgs.placeholder)}
                            value={value}
                            onApi={setApi}
                            onChange={setValue}
                            onKeyDown={handleKeyDown}
                            beforeExtensions={beforeExtensions}
                            extensions={extensions}
                            onCompletion={onCompletion}
                        />
                    </div>
                    <GenAiChatAgentSwitching
                        disabled={!value.trim()}
                        agentDropdownDisabled={false}
                        isAssistantLoading={false}
                        isConversationsLoading={false}
                        handleSubmit={handleSubmit}
                    />
                </div>
            </div>
        </div>
    );
}

/**
 * @internal
 */
export function GenAIStandaloneInput(props: GenAIStandaloneInputProps) {
    const { backend, workspace, locale, ...rest } = props;
    const effectiveBackend = useBackendStrict(backend);
    const effectiveWorkspace = useWorkspaceStrict(workspace);

    return (
        <IntlWrapper locale={locale}>
            <GenAiStore {...props} backend={effectiveBackend} workspace={effectiveWorkspace}>
                <StandaloneInputContent {...rest} />
            </GenAiStore>
        </IntlWrapper>
    );
}
