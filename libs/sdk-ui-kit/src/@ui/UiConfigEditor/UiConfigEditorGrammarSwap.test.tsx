// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { type ConfigEditorLanguage } from "./configEditorLanguage.js";
// Type-only, so the statement is erased and the module stays out of the registry until the dynamic
// import below puts it there.
import type { UiConfigEditor as UiConfigEditorComponent } from "./UiConfigEditor.js";

// The YAML grammar never finishes loading in this file: switching to it must CLEAR the JSON grammar
// rather than keep parsing (and linting) the document as JSON while the chunk is on the wire — or
// forever, when the import fails.
vi.mock("@codemirror/lang-yaml", () => ({
    yaml: () => new Promise(() => {}),
}));

// A grammar that never loads is only reachable with a cold grammar cache, and that cache is a module
// singleton shared by every suite in the worker once test isolation is off — warm, it would hand
// this file the real grammar before the mock above ever got a say. Dropping the module registry and
// importing the component afterwards buys both the cold cache and a component graph that resolves
// the mocked chunk; dropping it again at the end evicts that graph, so the suites that follow are
// not left with a YAML editor that can never highlight anything.
let UiConfigEditor: typeof UiConfigEditorComponent;

beforeAll(async () => {
    vi.resetModules();
    ({ UiConfigEditor } = await import("./UiConfigEditor.js"));
});

afterAll(() => {
    vi.resetModules();
});

function Host() {
    // Unparseable in both languages, so a switch leaves the text byte-identical (no remount) —
    // exactly the path where the old grammar used to linger.
    const [value, setValue] = useState('{"broken":');
    const [language, setLanguage] = useState<ConfigEditorLanguage>("json");

    return (
        <UiConfigEditor
            value={value}
            onChange={setValue}
            language={language}
            onLanguageChange={setLanguage}
            label="Definition"
        />
    );
}

describe("UiConfigEditor switching to a language whose grammar is still loading", () => {
    it("clears the previous grammar instead of keeping the document parsed as the old language", async () => {
        render(<Host />);

        // The JSON grammar loads and highlights the document.
        await waitFor(() => {
            expect(document.querySelector(".cm-line span")).not.toBeNull();
        });

        await userEvent.click(screen.getByRole("radio", { name: "YAML" }));

        // With the YAML grammar pending forever, the document must not stay highlighted as JSON.
        await waitFor(() => {
            expect(document.querySelector(".cm-line span")).toBeNull();
        });
    });
});
