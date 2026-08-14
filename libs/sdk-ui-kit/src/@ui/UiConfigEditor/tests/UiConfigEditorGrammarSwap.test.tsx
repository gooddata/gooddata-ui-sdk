// (C) 2026 GoodData Corporation

import { useState } from "react";

import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { type ConfigEditorLanguage } from "../configEditorLanguage.js";
import { UiConfigEditor } from "../UiConfigEditor.js";

// The YAML grammar never finishes loading in this file: switching to it must CLEAR the JSON
// grammar rather than keep parsing (and linting) the document as JSON while the chunk is on the
// wire — or forever, when the import fails.
vi.mock("@codemirror/lang-yaml", () => ({
    yaml: () => new Promise(() => {}),
}));

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
