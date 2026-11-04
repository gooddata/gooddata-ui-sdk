// (C) 2026 GoodData Corporation

import { type Diagnostic as LintDiagnostic, forEachDiagnostic, setDiagnostics } from "@codemirror/lint";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it, vi } from "vitest";
import { type Diagnostic, DiagnosticSeverity } from "vscode-languageserver-types";

import { type MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { DIAGNOSTIC_WIDGET_CLASS } from "../../codemirror/CodeEditor.styles.js";
import { shimMaqlEditor } from "../../mock/editor-shim.js";

import {
    initialValidity,
    isValid,
    maqlDiagnosticWidget,
    maqlLinter,
    showNextDiagnostic,
    validityListener,
} from "./validation.js";

shimMaqlEditor();

const SYNTAX_ERROR: Diagnostic = {
    range: { start: { line: 0, character: 0 }, end: { line: 0, character: 3 } },
    message: "missing 'select' at 'SEL'",
    severity: DiagnosticSeverity.Error,
};

/**
 * A language service that reports an error for `SEL`, and nothing for anything else, and that
 * answers only when the test says so.
 */
function createLanguageService(): MaqlLanguageService & { answer: () => void } {
    const pending: Array<() => void> = [];
    return {
        doValidation: (document: { getText(): string }) =>
            new Promise<Diagnostic[]>((resolve) => {
                pending.push(() => resolve(document.getText() === "SEL" ? [SYNTAX_ERROR] : []));
            }),
        answer: () => {
            pending.splice(0).forEach((resolve) => resolve());
        },
    } as unknown as MaqlLanguageService & { answer: () => void };
}

function lintDiagnostics(view: EditorView): LintDiagnostic[] {
    const diagnostics: LintDiagnostic[] = [];
    forEachDiagnostic(view.state, (diagnostic) => {
        diagnostics.push(diagnostic);
    });
    return diagnostics;
}

const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

let view: EditorView | undefined;

afterEach(() => {
    view?.destroy();
    view = undefined;
});

describe("maqlLinter", () => {
    it("reports the diagnostics of a change right away", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({
                doc: "",
                extensions: [maqlLinter(languageService), validityListener(onValid)],
            }),
            parent: document.body,
        });

        view.dispatch({ changes: { from: 0, insert: "SEL" } });
        await tick();
        languageService.answer();
        await tick();

        expect(lintDiagnostics(view).map((diagnostic) => diagnostic.message)).toEqual([SYNTAX_ERROR.message]);
        expect(isValid(view.state)).toBe(false);
        expect(onValid).toHaveBeenLastCalledWith(view, false);
    });

    it("reports only a change of the validity, the way Monaco reported changed markers only", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({
                doc: "SELECT 1",
                extensions: [maqlLinter(languageService), validityListener(onValid)],
            }),
            parent: document.body,
        });

        // The validation of valid code on opening, and of a change that keeps it valid.
        await tick();
        languageService.answer();
        await tick();
        view.dispatch({ changes: { from: 8, insert: ";" } });
        await tick();
        languageService.answer();
        await tick();
        expect(onValid).not.toHaveBeenCalled();

        view.dispatch({ changes: { from: 0, to: 9, insert: "SEL" } });
        await tick();
        languageService.answer();
        await tick();
        expect(onValid).toHaveBeenCalledTimes(1);
        expect(onValid).toHaveBeenLastCalledWith(view, false);

        view.dispatch({ changes: { from: 0, to: 3, insert: "SELECT 2" } });
        await tick();
        languageService.answer();
        await tick();
        expect(onValid).toHaveBeenCalledTimes(2);
        expect(onValid).toHaveBeenLastCalledWith(view, true);
    });

    it("reports valid code after a deletion dropped the diagnostics of the invalid code", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({
                doc: "",
                extensions: [maqlLinter(languageService), validityListener(onValid)],
            }),
            parent: document.body,
        });

        view.dispatch({ changes: { from: 0, insert: "SEL" } });
        await tick();
        languageService.answer();
        await tick();
        expect(onValid).toHaveBeenLastCalledWith(view, false);

        // Deleting the code takes its diagnostics with it; the validation of the empty code then
        // finds the editor valid already, yet the form still holds the invalid report.
        view.dispatch({ changes: { from: 0, to: 3 } });
        expect(isValid(view.state)).toBe(true);
        await tick();
        languageService.answer();
        await tick();

        expect(onValid).toHaveBeenCalledTimes(2);
        expect(onValid).toHaveBeenLastCalledWith(view, true);
    });
});

describe("initialValidity", () => {
    it("reports the validity of the code the editor opened with, on the next tick", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({ doc: "SEL", extensions: initialValidity(languageService, onValid) }),
            parent: document.body,
        });

        await tick();
        languageService.answer();
        await tick();

        expect(onValid).toHaveBeenCalledWith(view, false);
    });

    it("validates the code the form settled on, not the code the editor was created with", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({
                doc: "SELECT",
                extensions: initialValidity(languageService, onValid),
            }),
            parent: document.body,
        });

        // The form switches from the saved code to the edited code in an effect, before the tick.
        view.dispatch({ changes: { from: 3, to: 6 } });
        await tick();
        languageService.answer();
        await tick();

        expect(onValid).toHaveBeenCalledWith(view, false);
    });

    it("stays silent for valid code, so the form keeps the edited code it is about to show", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({
                doc: "SELECT 1",
                extensions: initialValidity(languageService, onValid),
            }),
            parent: document.body,
        });

        await tick();
        languageService.answer();
        await tick();

        expect(onValid).not.toHaveBeenCalled();
    });

    it("reports after the editor is gone, the way the tab status needs it", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        const editor = new EditorView({
            state: EditorState.create({ doc: "SEL", extensions: initialValidity(languageService, onValid) }),
            parent: document.body,
        });

        editor.destroy();
        await tick();
        languageService.answer();
        await tick();

        expect(onValid).toHaveBeenCalledWith(editor, false);
    });

    it("leaves code that changed during the request to the linter", async () => {
        const languageService = createLanguageService();
        const onValid = vi.fn();
        view = new EditorView({
            state: EditorState.create({ doc: "SEL", extensions: initialValidity(languageService, onValid) }),
            parent: document.body,
        });

        await tick();
        view.dispatch({ changes: { from: 3, insert: "ECT" } });
        languageService.answer();
        await tick();

        expect(onValid).not.toHaveBeenCalled();
    });
});

describe("maqlDiagnosticWidget", () => {
    const widgetMessage = (view: EditorView) =>
        view.dom.querySelector(`.${DIAGNOSTIC_WIDGET_CLASS} .message`)?.textContent ?? null;
    const error = (from: number, to: number, message: string): LintDiagnostic => ({
        from,
        to,
        severity: "error",
        message,
    });

    it("shows the most severe diagnostic on F8 and follows a refresh of the diagnostics", () => {
        view = new EditorView({
            state: EditorState.create({ doc: "SELECT SUM;", extensions: maqlDiagnosticWidget() }),
            parent: document.body,
        });

        view.dispatch(setDiagnostics(view.state, [error(10, 11, "expecting '('")]));
        expect(showNextDiagnostic(view)).toBe(true);
        expect(widgetMessage(view)).toBe("expecting '('");

        // The validation of the latest keystroke answers after F8.
        view.dispatch(setDiagnostics(view.state, [error(7, 10, "unknown function")]));
        expect(widgetMessage(view)).toBe("unknown function");

        view.dispatch(setDiagnostics(view.state, []));
        expect(widgetMessage(view)).toBeNull();
    });

    it("starts with the diagnostic under the cursor, the way Monaco did, then steps through the rest", () => {
        view = new EditorView({
            state: EditorState.create({
                doc: "SELECT SUM;",
                selection: { anchor: 11 },
                extensions: maqlDiagnosticWidget(),
            }),
            parent: document.body,
        });
        view.dispatch(
            setDiagnostics(view.state, [
                error(7, 10, "The call expression 'SUM()' has invalid arguments"),
                error(10, 11, "mismatched input ';' expecting '('"),
            ]),
        );

        expect(showNextDiagnostic(view)).toBe(true);
        expect(widgetMessage(view)).toBe("mismatched input ';' expecting '('");

        expect(showNextDiagnostic(view)).toBe(true);
        expect(widgetMessage(view)).toBe("The call expression 'SUM()' has invalid arguments");
    });

    it("closes when the code changes", () => {
        view = new EditorView({
            state: EditorState.create({ doc: "SELECT SUM;", extensions: maqlDiagnosticWidget() }),
            parent: document.body,
        });

        view.dispatch(setDiagnostics(view.state, [error(10, 11, "expecting '('")]));
        showNextDiagnostic(view);
        view.dispatch({ changes: { from: 11, insert: " " } });

        expect(widgetMessage(view)).toBeNull();
    });
});
