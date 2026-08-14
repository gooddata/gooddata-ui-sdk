// (C) 2026 GoodData Corporation

import { type ReactNode, type Ref } from "react";

import { type YamlCompletionSource } from "../../syntaxHighlightingInput/yamlPosition.js";

import { type ConfigEditorLanguage } from "./configEditorLanguage.js";

/**
 * Imperative operations on the editor's text, for callers that need to act at the cursor.
 *
 * @internal
 */
export interface IUiConfigEditorApi {
    /** Replaces the current selection with `text` and leaves the caret directly after it. */
    insertAtCursor: (text: string) => void;
    focus: () => void;
}

/**
 * What the editor hands a caller rendering the toolbar's context menu.
 *
 * @internal
 */
export interface IUiConfigEditorContextMenuProps {
    /** Closes the menu — pass straight to `UiMenu`'s `onClose`. */
    onClose: () => void;
    /**
     * Identity for the menu, naming it after the button that opened it. Spread onto `UiMenu`'s
     * required `ariaAttributes`.
     */
    ariaAttributes: { id: string; "aria-labelledby": string };
}

/**
 * The editor's localized texts, gathered in one object so adding a text does not grow the prop
 * list. The caller localizes them, as with the other kit primitives; every key is optional.
 *
 * @internal
 */
export interface IUiConfigEditorLabels {
    /**
     * Radio label per offered language, keyed by the language. Optional and partial: a language
     * without an entry falls back to its technical name ("JSON", "YAML"), which as format names
     * are usually left untranslated.
     */
    languages?: Partial<Record<ConfigEditorLanguage, string>>;
    /** Label of the action that re-formats the current text. Defaults to "Auto-format". */
    autoFormat?: string;
    /** Accessible name for the language radio group, e.g. "Editor language". */
    languageSwitcher?: string;
    /** Accessible name for the button opening the context menu, e.g. "More actions". */
    contextMenu?: string;
    /**
     * Localized message shown on each syntax-error diagnostic in the lint gutter. Read when the
     * editor mounts (and whenever the language changes); a later change to it is not picked up on
     * its own. Without it no syntax linting is installed.
     */
    syntaxError?: string;
}

/**
 * @internal
 */
export interface IUiConfigEditorProps {
    /**
     * The value, as text in the primary language. The component's single source of truth — any other
     * offered language is only ever a rendering of it.
     */
    value: string;
    /**
     * Fires with the next value, as text in the primary language.
     *
     * While a draft cannot be parsed, the raw draft is passed through verbatim instead. Callers
     * already validate this value by parsing it, so the invalid text reaching them unchanged is what
     * makes their existing "invalid definition" handling report the problem.
     */
    onChange: (next: string) => void;
    /** Language the value is written in — what `onChange` emits. Defaults to JSON. */
    primaryLanguage?: ConfigEditorLanguage;
    /**
     * Languages offered in the toolbar's switcher, in render order. With fewer than two entries no
     * switcher is rendered at all and the value is shown in the primary language, verbatim — the
     * editor never converts anything. Defaults to JSON and YAML.
     *
     * Only a JSON primary offers projections: YAML is a superset of JSON, so projecting the other
     * way an invalid JSON draft can be a valid YAML document, and the pass-through contract could
     * hand the caller text that validates as something the user never saw validated. With any
     * other primary the editor is single-language regardless of this prop.
     */
    languages?: ConfigEditorLanguage[];
    /**
     * Language the text is displayed in. Controlled: the caller owns it, and any persistence of it.
     * Defaults to the primary language, which is also what a single-language editor always
     * displays. Honored only with a JSON primary, and the switcher renders only when this and
     * `onLanguageChange` are both supplied — the controlled pair is what makes a selection able to
     * take effect.
     */
    language?: ConfigEditorLanguage;
    /**
     * Reports the language the user picked in the switcher. Without it no switcher is rendered,
     * whatever `languages` offers — the editor is controlled and cannot honor a selection it has
     * no way to report.
     */
    onLanguageChange?: (next: ConfigEditorLanguage) => void;
    /**
     * Schema-aware autocompletion for YAML, consulted while YAML is the displayed language. It is
     * handed the position's enclosing mapping keys, so completions can follow the document's shape.
     */
    completionSource?: YamlCompletionSource;
    /** The editor's localized texts. Anything omitted falls back to a neutral default. */
    labels?: IUiConfigEditorLabels;
    /**
     * Renders the contents of the toolbar's context menu, usually a `UiMenu`.
     *
     * The editor owns the button that opens it and the popover it sits in; what goes inside is the
     * caller's, since the actions on offer are specific to what is being edited. Omit the prop and
     * no button is rendered at all.
     */
    renderContextMenu?: (props: IUiConfigEditorContextMenuProps) => ReactNode;
    /**
     * Accessible name for the editor, wired to its aria-label. CodeMirror has no labellable input
     * element, so a visible caption cannot be attached with `htmlFor` — pass its text here too.
     */
    label?: string;
    placeholder?: string;
    /**
     * Renders the value without allowing edits, while keeping it focusable and selectable so it can
     * still be read and copied with a keyboard or screen reader. The language toggle stays available
     * — switching it only changes how the value is displayed.
     */
    readOnly?: boolean;
    /** Blocks editing and the whole toolbar, e.g. while a save is in flight. */
    disabled?: boolean;
    /** Visible height, in text rows. The editor also grows to fill a taller parent. */
    rows?: number;
    dataTestId?: string;
    editorRef?: Ref<IUiConfigEditorApi>;
}
