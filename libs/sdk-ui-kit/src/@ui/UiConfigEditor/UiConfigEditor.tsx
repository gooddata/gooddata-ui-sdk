// (C) 2026 GoodData Corporation

import {
    type CSSProperties,
    useCallback,
    useEffect,
    useId,
    useImperativeHandle,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { type CompletionSource } from "@codemirror/autocomplete";
import { forceLinting, lintGutter } from "@codemirror/lint";
import { Compartment } from "@codemirror/state";
import { type EditorView, lineNumbers } from "@codemirror/view";

import { createSyntaxErrorLinter } from "../../syntaxHighlightingInput/syntaxErrorLinter.js";
import { SyntaxHighlightingInput } from "../../syntaxHighlightingInput/SyntaxHighlightingInput.js";
import { yamlPositionAt } from "../../syntaxHighlightingInput/yamlPosition.js";
import { bem } from "../@utils/bem.js";

import { useLanguageGrammar } from "./configEditorGrammars.js";
import { themedHighlighting } from "./configEditorHighlighting.js";
import { type ConfigEditorLanguage, beautify, convertText, isProjectable } from "./configEditorLanguage.js";
import { ConfigEditorToolbar } from "./ConfigEditorToolbar.js";
import { type IUiConfigEditorProps } from "./types.js";

const { b, e } = bem("gd-ui-kit-config-editor");

/**
 * A config editor: a CodeMirror source editor with syntax highlighting, line numbers and a lint
 * gutter, plus a toolbar to re-format the text and — when more than one language is offered — to
 * read and edit the same value as either JSON or YAML.
 *
 * The primary language is always the value in and the value out. Any other offered language is a
 * convenience projection converted on the fly, so a caller never has to know which language the user
 * happens to be looking at. A single-language editor never converts at all: what is typed is what is
 * emitted, byte for byte, so YAML comments and formatting the caller cares about survive.
 *
 * Switching language re-emits the value in canonical form, which is what makes switching to YAML and
 * back re-format the JSON. The canonical form matches the `JSON.stringify(value, null, 4)` that
 * callers conventionally seed the field with, so a switch on an untouched value is a no-op rather
 * than something that marks a form dirty.
 *
 * @internal
 */
export function UiConfigEditor({
    value,
    onChange,
    primaryLanguage = "json",
    languages = ["json", "yaml"],
    language,
    onLanguageChange,
    completionSource,
    labels,
    renderContextMenu,
    label,
    placeholder,
    readOnly = false,
    disabled = false,
    rows = 12,
    dataTestId,
    editorRef,
}: IUiConfigEditorProps) {
    // Scoped to this instance: several editors can sit on one page, and a shared radio `name` would
    // make their language switchers fight over the same group.
    const instanceId = useId();
    const languageGroupName = `config-editor-language-${instanceId}`;
    const contextMenuButtonId = `config-editor-menu-button-${instanceId}`;

    // Only a JSON primary may display another language (see `languages` in types.ts), and only
    // one the caller actually offers — a shared, persisted `language` must not trap a
    // single-language editor in a projection it never presents a way out of. Anything else falls
    // back to the primary rather than letting an unsound display in through the back door.
    const displayLanguage =
        primaryLanguage === "json" &&
        language !== undefined &&
        languages.length > 1 &&
        languages.includes(language)
            ? language
            : primaryLanguage;
    // The switcher needs the full controlled pair: without `language` a selection could never take
    // effect, and the radios would appear to accept it and immediately snap back.
    const isSwitchable = primaryLanguage === "json" && language !== undefined && !!onLanguageChange;

    // The text actually on screen, in the displayed language. `value` stays primary regardless.
    const [draft, setDraft] = useState(() => convertText(value, primaryLanguage, displayLanguage));
    // Bumped to remount the editor when a language switch rewrites the document; a switch that
    // leaves the text byte-identical (an unprojectable draft) keeps the editor instance, so the
    // caret and undo history survive. The compartment swaps the grammar into the live view then.
    const [editorEpoch, setEditorEpoch] = useState(0);
    const draftRef = useRef(draft);
    draftRef.current = draft;
    // The primary-language text last handed to `onChange`, so a controlled parent echoing it back is
    // not mistaken for an outside edit that should overwrite what the user is typing.
    const lastEmittedRef = useRef(value);
    const lastLanguageRef = useRef(displayLanguage);
    // Set when the language change came from this editor's own switcher. The caller may share the
    // language across several mounted editors, and only the one the user actually interacted with
    // may rewrite its value in the new canonical form — the others only re-render their view.
    const languageChangeIsLocalRef = useRef(false);
    const viewRef = useRef<EditorView | null>(null);

    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;

    // Re-derive the draft when the language changes, or when `value` changes from the outside (an
    // example applied, a dialog reset). useLayoutEffect so the new text is in place before paint.
    useLayoutEffect(() => {
        const languageChanged = lastLanguageRef.current !== displayLanguage;
        if (!languageChanged && value === lastEmittedRef.current) {
            return;
        }
        lastLanguageRef.current = displayLanguage;
        const isLocalLanguageChange = languageChanged && languageChangeIsLocalRef.current;
        languageChangeIsLocalRef.current = false;
        const nextDraft = convertText(value, primaryLanguage, displayLanguage);
        lastEmittedRef.current = value;
        if (languageChanged && (nextDraft !== draftRef.current || completionSource !== undefined)) {
            // A rewritten document remounts the editor: undo has nothing coherent to return to.
            // An identical document keeps the running editor (see `editorEpoch`) — unless a
            // completion source is in play, whose wiring is mount-only and per-language, so
            // keeping the instance would leave the old language's completion behavior active.
            setEditorEpoch((epoch) => epoch + 1);
        }
        setDraft(nextDraft);

        // Report the value in the new language's canonical form — projecting through YAML and back
        // is what re-formats sloppy JSON. Done explicitly: the editor's own value sync is annotated
        // `Transaction.remote`, which the change handler skips.
        //
        // Only for a switch made on this editor, though: a caller may share the language across
        // several mounted editors, and the ones that did not participate in the interaction must
        // not rewrite their values (and dirty their forms) as a side effect.
        //
        // Only when the value really parses: text the user is midway through breaking has no
        // faithful projection, and re-reading it in the other language would change its meaning.
        //
        // And never while the value is not the user's to change: in those modes the toggle is only a
        // way to read the value in another language, so it must not rewrite it.
        if (!isLocalLanguageChange || !isProjectable(value, primaryLanguage) || readOnly || disabled) {
            return;
        }
        const nextValue = convertText(nextDraft, displayLanguage, primaryLanguage);
        if (nextValue !== value) {
            lastEmittedRef.current = nextValue;
            onChangeRef.current(nextValue);
        }
    }, [value, primaryLanguage, displayLanguage, readOnly, disabled, completionSource]);

    const emit = useCallback(
        (nextDraft: string) => {
            const nextValue = convertText(nextDraft, displayLanguage, primaryLanguage);
            lastEmittedRef.current = nextValue;
            onChange(nextValue);
        },
        [displayLanguage, primaryLanguage, onChange],
    );

    // Only real edits arrive here: the editor's change handler skips the remote-annotated value
    // sync, so this component's own draft pushes never echo back as changes.
    const handleDraftChange = useCallback(
        (nextDraft: string) => {
            setDraft(nextDraft);
            emit(nextDraft);
        },
        [emit],
    );

    const beautified = useMemo(() => beautify(draft, displayLanguage), [draft, displayLanguage]);
    // Already-formatted text disables the action too: emitting an identical value would only make
    // the caller believe something changed — an As-Code dialog would mark its form dirty.
    const canAutoFormat = beautified !== undefined && beautified !== draft;

    const handleBeautify = useCallback(() => {
        if (beautified === undefined || beautified === draft) {
            return;
        }
        setDraft(beautified);
        emit(beautified);
    }, [beautified, draft, emit]);

    const handleSelectLanguage = useCallback(
        (next: ConfigEditorLanguage) => {
            // Marks the coming language-prop change as this editor's own interaction, so the
            // canonical re-emit runs here and not in other editors sharing the language.
            languageChangeIsLocalRef.current = true;
            onLanguageChange?.(next);
        },
        [onLanguageChange],
    );

    // The handle is rebuilt when editability changes rather than reading a ref written during
    // render: an abandoned render must not be able to leave a speculative value behind. Callers
    // read `ref.current` at call time, so a new handle identity costs them nothing.
    useImperativeHandle(
        editorRef,
        () => ({
            insertAtCursor: (text: string) => {
                const view = viewRef.current;
                // CodeMirror's non-editable state only blocks user input, not programmatic
                // dispatches, so a read-only or in-flight editor has to be refused here.
                if (!view || readOnly || disabled) {
                    return;
                }
                const { from, to } = view.state.selection.main;
                // CodeMirror places the caret and keeps the insertion in view itself; the resulting
                // document change flows back out through the editor's own change handler.
                view.dispatch({
                    changes: { from, to, insert: text },
                    selection: { anchor: from + text.length },
                    scrollIntoView: true,
                });
                view.focus();
            },
            focus: () => viewRef.current?.focus(),
        }),
        [readOnly, disabled],
    );

    // Completion availability is fixed when the editor mounts: the wrapper is installed only if
    // a source is present then, and it dereferences the live ref, so removing the source later
    // would make an invoked completion throw while adding one would do nothing.
    const hasCompletionRef = useRef(completionSource !== undefined);
    useEffect(() => {
        const hasCompletion = completionSource !== undefined;
        if (hasCompletionRef.current !== hasCompletion) {
            hasCompletionRef.current = hasCompletion;
            setEditorEpoch((epoch) => epoch + 1);
        }
    }, [completionSource]);

    const grammar = useLanguageGrammar(displayLanguage);

    // The grammar lives in a compartment so a first-time load can be injected into the running
    // view: remounting instead would throw away whatever the user did while the chunk was on the
    // wire — selection, undo history, focus — and their next keystroke would land at offset 0.
    const grammarCompartmentRef = useRef(new Compartment());

    useEffect(() => {
        const view = viewRef.current;
        if (view) {
            // `grammar ?? []` and not a skip: switching to a language whose grammar is still
            // loading must clear the previous one, or the document keeps being parsed, highlighted
            // and linted as the old language until the chunk arrives — indefinitely, if it fails.
            view.dispatch({
                effects: grammarCompartmentRef.current.reconfigure(grammar ?? []),
            });
            // The reconfigure changes neither the document nor the lint configuration, so the
            // linter would not run again on its own — stale diagnostics from the previous grammar
            // (or from the grammar-less tree) would stay in the gutter.
            forceLinting(view);
        }
    }, [grammar]);

    // Extensions are read once when CodeMirror initialises, so the editor is remounted (keyed on
    // language) to swap grammars. Losing the undo history is reasonable there: the document was
    // just rewritten in a different language, so there is nothing coherent left to undo into.
    const syntaxErrorMessage = labels?.syntaxError;
    const extensions = useMemo(
        () => [
            grammarCompartmentRef.current.of(grammar ?? []),
            themedHighlighting,
            lineNumbers(),
            lintGutter(),
            ...(syntaxErrorMessage ? [createSyntaxErrorLinter(syntaxErrorMessage)] : []),
        ],
        // Keyed on `grammar` (which changes with the language) rather than the language itself: a
        // running view gets a late-arriving grammar through the effect above, but any later remount
        // (a completion-source toggle, say) is built from this memo — stale, it would mount an
        // editor with no grammar at all.
        [grammar, syntaxErrorMessage],
    );

    // The completion source speaks in terms of the document's shape — the mapping keys enclosing the
    // position — so the raw CodeMirror context is resolved into that here. YAML only: the position
    // reader walks a YAML parse tree, and no JSON consumer has a completion schema.
    const onCompletion = useMemo<CompletionSource | undefined>(
        () =>
            completionSource && displayLanguage === "yaml"
                ? (context) => completionSource(context, yamlPositionAt(context.state, context.pos))
                : undefined,
        [completionSource, displayLanguage],
    );

    return (
        <div
            className={b({ disabled, readOnly })}
            style={{ "--config-editor-rows": rows } as CSSProperties}
            data-testid={dataTestId}
        >
            <ConfigEditorToolbar
                languages={isSwitchable ? languages : []}
                displayLanguage={displayLanguage}
                onSelectLanguage={handleSelectLanguage}
                labels={labels}
                canAutoFormat={canAutoFormat}
                onAutoFormat={handleBeautify}
                renderContextMenu={renderContextMenu}
                readOnly={readOnly}
                disabled={disabled}
                languageGroupName={languageGroupName}
                contextMenuButtonId={contextMenuButtonId}
            />
            <div className={e("editor")}>
                <SyntaxHighlightingInput
                    key={editorEpoch}
                    value={draft}
                    onChange={handleDraftChange}
                    // An external replace means a new document here (an applied example, a dialog
                    // reset), so the cursor goes to its end — a stale clamped offset would drop the
                    // next inserted variable at the very start of the fresh text.
                    externalChangeSelection="end"
                    onCompletion={onCompletion}
                    label={label ?? "Code editor"}
                    placeholder={placeholder}
                    // CodeMirror's non-editable state keeps the content focusable and selectable,
                    // which is what both the read-only view and an in-flight save want.
                    disabled={readOnly || disabled}
                    extensions={extensions}
                    onApi={(view) => {
                        viewRef.current = view;
                    }}
                />
            </div>
        </div>
    );
}
