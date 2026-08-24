// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { preloadUiConfigEditorGrammars } from "./configEditorGrammars.js";
import { UiConfigEditor } from "./UiConfigEditor.js";

// This file is about the value the editor REPORTS on a language switch, not about the editing:
// switching must re-emit the value in the new language's canonical form on its own, because the
// editor's own value sync is remote-annotated and so never reaches the change handler. `onChange`
// staying silent below is what proves that — the real editor is rendered rather than stubbed away,
// since a stub in its place would replace a module the other suites in this worker share.
const CANONICAL_JSON = JSON.stringify({ a: { b: 1 } }, null, 4);

/** The text on screen, rebuilt from CodeMirror's rendered lines. */
function displayedText() {
    return Array.from(document.querySelectorAll(".cm-line"))
        .map((line) => line.textContent)
        .join("\n");
}

// The editor loads its language grammar on demand; tests assert on a fully initialized editor
// synchronously, so the grammars are warmed up front.
beforeAll(() => preloadUiConfigEditorGrammars());

describe("UiConfigEditor language switch, without the editor echoing changes back", () => {
    const renderEditor = (value: string, onChange = vi.fn(), onLanguageChange = vi.fn()) => {
        const result = render(
            <UiConfigEditor
                value={value}
                onChange={onChange}
                language="json"
                onLanguageChange={onLanguageChange}
            />,
        );
        return { ...result, onChange, onLanguageChange };
    };

    it("reports the re-formatted value when the language is switched on this editor", async () => {
        const onChange = vi.fn();
        const onLanguageChange = vi.fn();
        const { rerender } = render(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="json"
                onLanguageChange={onLanguageChange}
            />,
        );
        expect(onChange).not.toHaveBeenCalled();

        // The user clicks the radio, and the host flips the controlled language prop in response.
        await userEvent.click(screen.getByRole("radio", { name: "YAML" }));
        expect(onLanguageChange).toHaveBeenCalledWith("yaml");
        rerender(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="yaml"
                onLanguageChange={onLanguageChange}
            />,
        );

        expect(onChange).toHaveBeenCalledWith(CANONICAL_JSON);
    });

    it("does not rewrite the value when the language prop changes without an interaction here", () => {
        // A caller may share the language across several mounted editors (one localStorage key for
        // the whole app): flipping it in one dialog re-renders the others' views, but only the
        // editor whose switcher was used may rewrite its value — this one merely follows along.
        const onChange = vi.fn();
        const { rerender } = render(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="json"
                onLanguageChange={vi.fn()}
            />,
        );

        rerender(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="yaml"
                onLanguageChange={vi.fn()}
            />,
        );

        expect(onChange).not.toHaveBeenCalled();
        // The view still follows the shared language.
        expect(displayedText()).toContain("a:");
    });

    it("stays quiet when the value is already canonical, so a form is not marked dirty", () => {
        const onChange = vi.fn();
        const { rerender } = render(
            <UiConfigEditor
                value={CANONICAL_JSON}
                onChange={onChange}
                language="json"
                onLanguageChange={vi.fn()}
            />,
        );

        rerender(
            <UiConfigEditor
                value={CANONICAL_JSON}
                onChange={onChange}
                language="yaml"
                onLanguageChange={vi.fn()}
            />,
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    it.each([
        ["a bare scalar", "foo"],
        ["a mapping", "key: value"],
        ["a half-typed object", '{"a": '],
    ])("leaves %s alone when it is broken JSON that YAML would happily reinterpret", (_label, value) => {
        // Switching language must only re-render the value, never give it a new meaning. `foo` is
        // invalid JSON but a valid YAML string, so reinterpreting it would both rewrite what the
        // user typed and turn an invalid definition into a valid one behind their back.
        const onChange = vi.fn();
        const { rerender } = render(
            <UiConfigEditor value={value} onChange={onChange} language="json" onLanguageChange={vi.fn()} />,
        );

        rerender(
            <UiConfigEditor value={value} onChange={onChange} language="yaml" onLanguageChange={vi.fn()} />,
        );

        expect(onChange).not.toHaveBeenCalled();
        expect(displayedText()).toContain(value.trim());
    });

    it.each([
        ["read-only", { readOnly: true }],
        ["disabled", { disabled: true }],
    ])("does not rewrite the value on a language switch when %s", (_label, mode) => {
        // In these modes the toggle is only a way to read the value in another language.
        const onChange = vi.fn();
        const { rerender } = render(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="json"
                onLanguageChange={vi.fn()}
                {...mode}
            />,
        );

        rerender(
            <UiConfigEditor
                value='{"a":{"b":1}}'
                onChange={onChange}
                language="yaml"
                onLanguageChange={vi.fn()}
                {...mode}
            />,
        );

        expect(onChange).not.toHaveBeenCalled();
    });

    it("shows the value in the requested language", () => {
        renderEditor(CANONICAL_JSON);

        expect(displayedText()).toContain('"a"');
    });

    it("asks the host to change language when a toolbar button is used", async () => {
        const onLanguageChange = vi.fn();
        renderEditor(CANONICAL_JSON, vi.fn(), onLanguageChange);

        await userEvent.click(screen.getByRole("radio", { name: "YAML" }));

        expect(onLanguageChange).toHaveBeenCalledWith("yaml");
    });
});
