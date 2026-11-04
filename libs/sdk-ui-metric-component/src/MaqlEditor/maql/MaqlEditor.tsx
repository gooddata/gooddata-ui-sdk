// (C) 2021-2026 GoodData Corporation

import {
    type Ref,
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useInsertionEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { EditorState, type Extension, Prec } from "@codemirror/state";
import { EditorView, type KeyBinding, keymap } from "@codemirror/view";
import classNames from "classnames";
import { FormattedMessage, useIntl } from "react-intl";
import { type CompletionList } from "vscode-languageserver-types";

import { type IMetadataObject } from "@gooddata/sdk-model";
import { useBackendStrict, useWorkspaceStrict } from "@gooddata/sdk-ui";

import { CodeEditor } from "../codemirror/CodeEditor.js";
import { type IMaqlEditorIcons } from "../codemirror/CodeEditor.styles.js";
import { type IContextMenuItem, platformShortcut, useCommonMenuItems } from "../codemirror/ContextMenu.js";
import { type MaqlEditorView } from "../codemirror/types.js";
import { type IRootRef } from "../components/ExpandableTooltip.js";
import { useCodeTheme } from "../hooks/useCodeTheme.js";
import { StatusBar, suggestionElementObserver } from "../statusBar/SuggestionStatusBar.js";
import { type MaqlEditorDefaultTheme } from "../theme/default.js";
import { ThemeProvider } from "../theme/theme.js";

import { maqlCompletion } from "./extensions/completion.js";
import { decorationsPlugin, maqlDecorations } from "./extensions/decorations.js";
import { formatMaqlDocument, formatMaqlSelection, maqlFormattingKeymap } from "./extensions/formatting.js";
import { maqlHover } from "./extensions/hover.js";
import { semanticTokens } from "./extensions/semanticTokens.js";
import {
    initialValidity,
    isValid,
    maqlDiagnosticWidget,
    maqlLinter,
    showNextDiagnostic,
    validityListener,
} from "./extensions/validation.js";
import { useLanguageService } from "./hooks/useLanguageService.js";
import { useLanguageServiceInitializer } from "./hooks/useLanguageServiceInitializer.js";
import { MaqlEditorClass, MaqlEditorTestClass, MaqlStyles } from "./MaqlEditor.styles.js";
import { destroyMaqlTooltip } from "./MaqlEditor.tooltip.js";
import { maqlLanguageSupport } from "./maqlLanguage.js";

/**
 * @internal
 */
export interface IMaqlEditorApi {
    autoformat: () => void;
    getValue: () => string;
    getValid: () => boolean;
}

/**
 * @internal
 */
export interface IMaqlEditorProps {
    cssTheme?: MaqlEditorDefaultTheme;
    autofocus?: boolean;
    /**
     * Show the first error when the editor gets the focus, until the code changes or becomes valid.
     */
    autohint?: boolean;
    decorators?: boolean;
    defaultValue?: string;
    readonly?: boolean;
    inline?: boolean;
    icons?: IMaqlEditorIcons;
    /**
     * The accessible name of the editor.
     */
    ariaLabel?: string;
    /**
     * Extra key bindings of the host. They win over the editor's own.
     */
    keyBindings?: readonly KeyBinding[];
    onFocus?: (editor: MaqlEditorView) => void;
    onBlur?: (editor: MaqlEditorView) => void;
    onEditorMount?: (editor: MaqlEditorView) => void;
    onEditorUpdate?: (editor: MaqlEditorView) => void;
    onChange?: (editor: MaqlEditorView, value: string) => void;
    onValid?: (editor: MaqlEditorView, valid: boolean) => void;
    onMetricOpen?: (editor: MaqlEditorView, object: IMetadataObject) => void;
    /**
     * Called when the user shows or hides the documentation of the suggestions.
     */
    onToggleSuggestionDetails?: (editor: MaqlEditorView, visible: boolean) => void;
    ref?: Ref<IMaqlEditorApi | null>;
}

/**
 * @internal
 */
export const MaqlEditor = forwardRef<IMaqlEditorApi, IMaqlEditorProps>(function MaqlEditor(
    {
        readonly = false,
        inline = false,
        autofocus = false,
        decorators = true,
        autohint = false,
        defaultValue = "",
        cssTheme,
        icons,
        ariaLabel,
        keyBindings,
        onFocus,
        onBlur,
        onEditorMount,
        onEditorUpdate,
        onMetricOpen,
        onToggleSuggestionDetails,
        onValid,
        onChange,
    },
    ref,
) {
    const [suggestionList, setSuggestionList] = useState<CompletionList | null>(null);
    const [suggestionElement, setSuggestionElement] = useState<HTMLElement | null>(null);
    const codeTheme = useCodeTheme();
    const editor = useRef<EditorView | null>(null);

    const languageService = useLanguageService();
    const initializeData = useLanguageServiceInitializer(languageService);

    const hints = useAutohint(autohint);
    const handlers = useLatest({
        onFocus,
        onBlur,
        onChange,
        onValid,
        onMetricOpen,
        onToggleSuggestionDetails,
    });

    const backend = useBackendStrict();
    const workspaceId = useWorkspaceStrict();
    const intl = useIntl();
    const hoverSettings = useLatest({ backend, workspaceId, intl });
    const tooltip = useRef<IRootRef | null>(null);

    const reportValidity = useCallback(
        (view: EditorView, valid: boolean) => {
            if (valid) {
                hints.set(false);
            }
            handlers.current.onValid?.(view, valid);
        },
        [handlers, hints],
    );

    const serviceExtensions = useMemo<Extension>(() => {
        if (!languageService || !initializeData) {
            return [];
        }
        const { capabilities } = initializeData;
        const legend = capabilities.semanticTokensProvider?.legend;

        return [
            legend ? semanticTokens(languageService, legend) : [],
            maqlCompletion({
                languageService,
                triggerCharacters: capabilities.completionProvider?.triggerCharacters ?? [],
                onList: setSuggestionList,
                onDocsToggle: (view, visible) => handlers.current.onToggleSuggestionDetails?.(view, visible),
            }),
            capabilities.hoverProvider
                ? maqlHover({
                      languageService,
                      tooltip,
                      getSettings: () => hoverSettings.current,
                      onOpen: (view, object) => handlers.current.onMetricOpen?.(view, object),
                  })
                : [],
            maqlLinter(languageService),
            initialValidity(languageService, reportValidity),
            maqlFormattingKeymap(languageService),
        ];
    }, [languageService, initializeData, hoverSettings, handlers, reportValidity]);

    const decorationsExtension = useMemo<Extension>(
        () => (languageService ? decorationsPlugin(languageService, decorators) : []),
        [languageService, decorators],
    );

    const editorExtensions = useMemo<Extension>(
        () => [
            maqlLanguageSupport(),
            maqlDecorations(),
            maqlDiagnosticWidget(),
            suggestionElementObserver(setSuggestionElement),
            validityListener(reportValidity),
            EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    hints.set(false);
                    handlers.current.onChange?.(update.view, update.state.doc.toString());
                }
            }),
            EditorView.domEventHandlers({
                focus: (_event, view) => {
                    if (hints.get()) {
                        showNextDiagnostic(view);
                    }
                    handlers.current.onFocus?.(view);
                    return false;
                },
                blur: (_event, view) => {
                    handlers.current.onBlur?.(view);
                    return false;
                },
            }),
        ],
        [handlers, hints, reportValidity],
    );

    const keyBindingsExtension = useMemo<Extension>(
        () => (keyBindings?.length ? Prec.highest(keymap.of([...keyBindings])) : []),
        [keyBindings],
    );

    // The labels the editor renders itself, in the locale of the application.
    const phrasesExtension = useMemo<Extension>(
        () =>
            EditorState.phrases.of({
                Documentation: intl.formatMessage({
                    id: "metricComponent.editMetric.suggestion.documentation",
                }),
                Close: intl.formatMessage({ id: "metricComponent.editMetric.suggestion.closeDocumentation" }),
            }),
        [intl],
    );

    const commonMenuItems = useCommonMenuItems();
    const contextMenu = useMemo<IContextMenuItem[]>(() => {
        const formatting: IContextMenuItem[] = languageService
            ? [
                  {
                      id: "format-document",
                      group: "edit",
                      label: intl.formatMessage({
                          id: "metricComponent.editMetric.contextMenu.formatDocument",
                      }),
                      shortcut: platformShortcut("⇧⌥F", "Shift+Alt+F"),
                      run: (view) => formatMaqlDocument(view, languageService),
                  },
                  {
                      id: "format-selection",
                      group: "edit",
                      label: intl.formatMessage({
                          id: "metricComponent.editMetric.contextMenu.formatSelection",
                      }),
                      shortcut: platformShortcut("⌘K ⌘F", "Ctrl+K Ctrl+F"),
                      run: (view) => formatMaqlSelection(view, languageService),
                  },
              ]
            : [];
        return [commonMenuItems.changeAllOccurrences, ...formatting, ...commonMenuItems.clipboard];
    }, [intl, languageService, commonMenuItems]);

    const extensions = useMemo<Extension>(
        () => [
            keyBindingsExtension,
            phrasesExtension,
            editorExtensions,
            serviceExtensions,
            decorationsExtension,
        ],
        [keyBindingsExtension, phrasesExtension, editorExtensions, serviceExtensions, decorationsExtension],
    );

    const onMount = useCallback(
        (view: EditorView) => {
            editor.current = view;
            onEditorMount?.(view);
        },
        [onEditorMount],
    );

    useImperativeHandle(ref, () => ({
        autoformat: () => {
            const view = editor.current;
            if (view && languageService) {
                void formatMaqlDocument(view, languageService).then(() => view.focus());
            }
        },
        getValid: () => (editor.current ? isValid(editor.current.state) : false),
        getValue: () => editor.current?.state.doc.toString() ?? "",
    }));

    useEffect(() => () => destroyMaqlTooltip(tooltip), []);

    return (
        <ThemeProvider theme={cssTheme}>
            <MaqlStyles />
            <CodeEditor
                inline={inline}
                readonly={readonly}
                autofocus={autofocus}
                className={classNames(MaqlEditorClass, MaqlEditorTestClass)}
                defaultValue={defaultValue}
                codeTheme={codeTheme}
                icons={icons}
                ariaLabel={ariaLabel}
                extensions={extensions}
                contextMenu={contextMenu}
                onEditorMount={onMount}
                onEditorUpdate={onEditorUpdate}
                ref={editor}
            />
            <StatusBar where={suggestionElement}>
                {suggestionList?.isIncomplete && (
                    <FormattedMessage id="metricEditor.status.lotsOfItemsInSuggestionResults" />
                )}
            </StatusBar>
        </ThemeProvider>
    );
});

/**
 * The latest value of changing props, readable from the editor extensions without rebuilding them.
 */
function useLatest<T>(value: T): { current: T } {
    const ref = useRef(value);
    // Written on commit, not during render: React may throw a render away, and the editor's
    // listeners must not see the values of a render that never committed.
    useInsertionEffect(() => {
        ref.current = value;
    });
    return ref;
}

/**
 * The autohint prop as a flag the editor extensions read and clear: a change of the prop sets
 * it, a change of the code or a valid validation clears it.
 */
function useAutohint(autohint: boolean): { get: () => boolean; set: (value: boolean) => void } {
    const value = useRef(autohint);
    useInsertionEffect(() => {
        value.current = autohint;
    }, [autohint]);
    return useMemo(
        () => ({
            get: () => value.current,
            set: (next: boolean) => {
                value.current = next;
            },
        }),
        [],
    );
}
