// (C) 2021-2026 GoodData Corporation

import { type Diagnostic, forEachDiagnostic, linter, setDiagnosticsEffect } from "@codemirror/lint";
import { type EditorState, type Extension, StateEffect, StateField } from "@codemirror/state";
import { type Command, EditorView, type Tooltip, ViewPlugin, keymap, showTooltip } from "@codemirror/view";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { DIAGNOSTIC_WIDGET_CLASS } from "../../codemirror/CodeEditor.styles.js";
import { createDocument, diagnosticsToLint } from "../../codemirror/lsp.js";
import { LANGUAGE } from "../constants.js";

/**
 * The diagnostics of the document, from the language service. An empty document is valid, and so
 * is one the validation failed on: the previous diagnostics no longer apply to it.
 */
async function validate(state: EditorState, languageService: MaqlLanguageService): Promise<Diagnostic[]> {
    const document = createDocument(state, LANGUAGE);
    if (document.getText().length === 0) {
        return [];
    }
    try {
        const diagnostics = await languageService.doValidation(document);
        return diagnosticsToLint(state.doc, diagnostics);
    } catch {
        return [];
    }
}

/**
 * Validates the code with the language service after each change, right away: Monaco validated
 * on the next tick, and the user reads the result (the error markers, the tab status) as soon as
 * they stop typing.
 */
export function maqlLinter(languageService: MaqlLanguageService): Extension {
    return linter((view) => validate(view.state, languageService), { delay: 0 });
}

/**
 * Reports the code the editor opened with as invalid when it is, the way Monaco did: on the next
 * tick, and with a request that outlives the editor, since a dialog that reopens on another tab
 * unmounts this one before the answer arrives and the tab still has to show its status. Valid
 * code is not reported, as Monaco raised no event for markers that stayed empty: the form around
 * the editor mounts with the saved code and switches to the edited code in an effect, and a
 * report that reaches it in between would hand it the saved code as the edited one. A change of
 * the code during the request is reported by the linter.
 */
export function initialValidity(
    languageService: MaqlLanguageService,
    onValid: (editor: EditorView, valid: boolean) => void,
): Extension {
    return ViewPlugin.define((view) => {
        setTimeout(() => {
            const state = view.state;
            void validate(state, languageService).then((diagnostics) => {
                if (view.state.doc === state.doc && hasErrors(diagnostics)) {
                    onValid(view, false);
                }
            });
        }, 0);
        return {};
    });
}

function hasErrors(diagnostics: readonly Diagnostic[]): boolean {
    return diagnostics.some((diagnostic) => diagnostic.severity === "error");
}

/**
 * Whether the code has no error diagnostics.
 */
export function isValid(state: EditorState): boolean {
    const diagnostics: Diagnostic[] = [];
    forEachDiagnostic(state, (diagnostic) => {
        diagnostics.push(diagnostic);
    });
    return !hasErrors(diagnostics);
}

function diagnosticsChanged(update: {
    transactions: readonly { effects: readonly StateEffect<unknown>[] }[];
}) {
    return update.transactions.some((transaction) =>
        transaction.effects.some((effect) => effect.is(setDiagnosticsEffect)),
    );
}

/**
 * Reports the validity each time a validation changes it from the last one reported. A validation
 * that confirms the last report is not reported, the way Monaco raised no event for unchanged
 * markers: the form reads a report as a change of the code, and the code it holds right after a
 * mount is not yet the code of the editor. The last report is what counts, not the diagnostics
 * in the editor: a deletion drops them before any validation runs, while the form still holds
 * the validity they stood for.
 */
export function validityListener(onValid: (editor: EditorView, valid: boolean) => void): Extension {
    let reported = true;

    return EditorView.updateListener.of((update) => {
        if (diagnosticsChanged(update)) {
            const valid = isValid(update.state);
            if (valid !== reported) {
                reported = valid;
                onValid(update.view, valid);
            }
        }
    });
}

const showDiagnostic = StateEffect.define<Diagnostic | null>();

function diagnosticTooltip(diagnostic: Diagnostic): Tooltip {
    return {
        pos: diagnostic.from,
        end: diagnostic.to,
        above: false,
        strictSide: true,
        create: () => {
            const dom = document.createElement("div");
            dom.className = DIAGNOSTIC_WIDGET_CLASS;
            const message = document.createElement("div");
            message.className = "message";
            message.textContent = diagnostic.message;
            dom.append(message);
            return { dom };
        },
    };
}

interface IActiveDiagnostic {
    diagnostic: Diagnostic;
    tooltip: Tooltip;
}

function activeDiagnostic(diagnostic: Diagnostic): IActiveDiagnostic {
    return { diagnostic, tooltip: diagnosticTooltip(diagnostic) };
}

/**
 * The diagnostic the user navigated to, shown under its line until the code changes. A refresh of
 * the diagnostics, which the validation sends right after a change, moves the widget to the most
 * severe of the new ones, so an F8 pressed while the validation runs shows the current error.
 */
const activeDiagnosticField = StateField.define<IActiveDiagnostic | null>({
    create: () => null,
    update(value, transaction) {
        if (transaction.docChanged) {
            return null;
        }
        let next = value;
        for (const effect of transaction.effects) {
            if (effect.is(showDiagnostic)) {
                next = effect.value ? activeDiagnostic(effect.value) : null;
            } else if (effect.is(setDiagnosticsEffect) && next) {
                const first = diagnosticAtCursor(
                    sortDiagnostics(effect.value),
                    transaction.state.selection.main.head,
                );
                next = first ? activeDiagnostic(first) : null;
            }
        }
        return next;
    },
    provide: (field) => showTooltip.from(field, (value) => value?.tooltip ?? null),
});

const SEVERITY_ORDER: Record<Diagnostic["severity"], number> = { error: 0, warning: 1, info: 2, hint: 3 };

/**
 * Diagnostics in navigation order: the most severe first, then by position.
 */
function sortDiagnostics(diagnostics: readonly Diagnostic[]): Diagnostic[] {
    return [...diagnostics].sort(
        (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.from - b.from,
    );
}

function orderedDiagnostics(state: EditorState): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];
    forEachDiagnostic(state, (diagnostic) => {
        diagnostics.push(diagnostic);
    });
    return sortDiagnostics(diagnostics);
}

/**
 * The diagnostic to show first, the way Monaco's marker navigation chose it: the first one, in
 * navigation order, under the cursor or after it, and the first one of all when the cursor is
 * past them. The end of a diagnostic counts as under the cursor, so the error of the character
 * just typed wins over an earlier one.
 */
function diagnosticAtCursor(diagnostics: readonly Diagnostic[], cursor: number): Diagnostic | undefined {
    return (
        diagnostics.find((diagnostic) => diagnostic.from <= cursor && cursor <= diagnostic.to) ??
        diagnostics.find((diagnostic) => diagnostic.from >= cursor) ??
        diagnostics[0]
    );
}

/**
 * Shows the next diagnostic: the one at the cursor first, then the following one on each call.
 */
export const showNextDiagnostic: Command = (view) => {
    const diagnostics = orderedDiagnostics(view.state);
    if (diagnostics.length === 0) {
        return false;
    }

    const active = view.state.field(activeDiagnosticField, false)?.diagnostic;
    const activeIndex = active
        ? diagnostics.findIndex(
              (diagnostic) => diagnostic.from === active.from && diagnostic.message === active.message,
          )
        : -1;
    const next =
        activeIndex === -1
            ? diagnosticAtCursor(diagnostics, view.state.selection.main.head)!
            : diagnostics[(activeIndex + 1) % diagnostics.length];

    view.dispatch({
        selection: { anchor: next.from },
        effects: showDiagnostic.of(next),
        scrollIntoView: true,
    });
    return true;
};

const hideDiagnostic: Command = (view) => {
    if (view.state.field(activeDiagnosticField) === null) {
        return false;
    }
    view.dispatch({ effects: showDiagnostic.of(null) });
    return true;
};

/**
 * The navigable diagnostic widget with its keys: F8 shows the next diagnostic, Escape hides it.
 */
export function maqlDiagnosticWidget(): Extension {
    return [
        activeDiagnosticField,
        keymap.of([
            { key: "F8", run: showNextDiagnostic },
            { key: "Escape", run: hideDiagnostic },
        ]),
    ];
}
