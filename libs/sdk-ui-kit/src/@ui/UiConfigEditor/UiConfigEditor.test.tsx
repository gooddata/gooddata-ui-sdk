// (C) 2026 GoodData Corporation

import { useRef, useState } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { preloadUiConfigEditorGrammars } from "./configEditorGrammars.js";
import { type ConfigEditorLanguage } from "./configEditorLanguage.js";
import { type IUiConfigEditorApi, type IUiConfigEditorProps } from "./types.js";
import { UiConfigEditor } from "./UiConfigEditor.js";

const CANONICAL_JSON = JSON.stringify({ a: { b: 1 } }, null, 4);

/** The text on screen, rebuilt from CodeMirror's rendered lines. */
function displayedText() {
    return Array.from(document.querySelectorAll(".cm-line"))
        .map((line) => line.textContent)
        .join("\n");
}

/** The value the host currently holds, which is always JSON text. */
function hostValue() {
    return screen.getByTestId("host-value").textContent;
}

/**
 * Mirrors how the dialogs use the editor: the host owns both the JSON value and the language, and
 * feeds them straight back in.
 */
function Host({
    initialValue = CANONICAL_JSON,
    initialLanguage = "json" as ConfigEditorLanguage,
    insertToken = "INSERTED",
    onChange,
    ...editorProps
}: {
    initialValue?: string;
    initialLanguage?: ConfigEditorLanguage;
    insertToken?: string;
    onChange?: (next: string) => void;
    readOnly?: boolean;
    disabled?: boolean;
    labels?: IUiConfigEditorProps["labels"];
    renderContextMenu?: IUiConfigEditorProps["renderContextMenu"];
    completionSource?: IUiConfigEditorProps["completionSource"];
}) {
    const [value, setValue] = useState(initialValue);
    const [language, setLanguage] = useState<ConfigEditorLanguage>(initialLanguage);
    const apiRef = useRef<IUiConfigEditorApi>(null);

    return (
        <div>
            <pre data-testid="host-value">{value}</pre>
            <button
                onClick={() => apiRef.current?.insertAtCursor(insertToken)}
                data-testid="insert-at-cursor"
            >
                insert
            </button>
            {/* Stands in for an "apply example" action: it replaces the value from the outside. */}
            <button onClick={() => setValue('{\n    "example": true\n}')} data-testid="replace-value">
                replace
            </button>
            <UiConfigEditor
                {...editorProps}
                value={value}
                onChange={(next) => {
                    onChange?.(next);
                    setValue(next);
                }}
                language={language}
                onLanguageChange={setLanguage}
                editorRef={apiRef}
                label="Definition"
            />
        </div>
    );
}

const clickLanguage = async (name: string) => {
    await userEvent.click(screen.getByRole("radio", { name }));
};

const clickButton = async (name: string) => {
    await userEvent.click(screen.getByRole("button", { name }));
};

// The editor loads its language grammar on demand; tests assert on a fully initialized editor
// synchronously, so the grammars are warmed up front.
beforeAll(() => preloadUiConfigEditorGrammars());

describe("UiConfigEditor", () => {
    it("shows the value as JSON with the JSON language selected", () => {
        render(<Host />);

        expect(displayedText()).toBe(CANONICAL_JSON);
        expect(screen.getByRole("radio", { name: "JSON" })).toBeChecked();
        expect(screen.getByRole("radio", { name: "YAML" })).not.toBeChecked();
    });

    it("asks the host to change language rather than deciding for itself", async () => {
        const onLanguageChange = vi.fn();
        render(
            <UiConfigEditor
                value={CANONICAL_JSON}
                onChange={vi.fn()}
                language="json"
                onLanguageChange={onLanguageChange}
            />,
        );

        await clickLanguage("YAML");

        expect(onLanguageChange).toHaveBeenCalledWith("yaml");
    });

    it("displays YAML once the host switches language, leaving the value as JSON", async () => {
        render(<Host />);

        await clickLanguage("YAML");

        // YAML documents end with a newline, hence the trailing empty line.
        expect(displayedText()).toBe("a:\n  b: 1\n");
        expect(hostValue()).toBe(CANONICAL_JSON);
    });

    it("re-formats sloppy JSON after a switch to YAML and back", async () => {
        render(<Host initialValue='{"a":{"b":1}}' />);

        await clickLanguage("YAML");
        await clickLanguage("JSON");

        expect(hostValue()).toBe(CANONICAL_JSON);
        expect(displayedText()).toBe(CANONICAL_JSON);
    });

    it("leaves an already canonical value byte-identical across a language round trip", async () => {
        // Guards the host's dirty-checking: switching language to look at a value must not count as
        // editing it.
        const onChange = vi.fn();
        render(<Host onChange={onChange} />);

        await clickLanguage("YAML");
        await clickLanguage("JSON");

        expect(hostValue()).toBe(CANONICAL_JSON);
        expect(onChange.mock.calls.every(([next]) => next === CANONICAL_JSON)).toBe(true);
    });

    it("reports edits made in YAML mode as JSON", async () => {
        render(<Host initialValue={JSON.stringify({ a: "x" }, null, 4)} initialLanguage="yaml" />);
        expect(displayedText()).toBe("a: x\n");

        // Edit the YAML document, the way typing would.
        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        expect(displayedText()).toBe("INSERTEDa: x\n");
        // Still a valid YAML mapping, so the host is handed JSON rather than the YAML text.
        expect(hostValue()).toBe(JSON.stringify({ INSERTEDa: "x" }, null, 4));
    });

    it("passes an unparseable YAML draft through so the host's own validation reports it", async () => {
        render(
            <Host
                initialValue={JSON.stringify({ a: "x" }, null, 4)}
                initialLanguage="yaml"
                // An unclosed double quote leaves the document mid-scalar, so YAML cannot parse it.
                insertToken={'"'}
            />,
        );

        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        const value = hostValue()!;
        expect(value).toBe('"a: x\n');
        // The host sees the broken text, so its own JSON validation is what reports the problem.
        expect(() => JSON.parse(value)).toThrow();
        expect(value).toBe(displayedText());
    });

    it("disables Beautify when there is nothing it could do", () => {
        render(<Host initialValue={""} />);

        expect(screen.getByRole("button", { name: "Auto-format" })).toBeDisabled();
    });

    it("disables Auto-format when the text is already in canonical form", () => {
        // Emitting an identical value would only dirty the caller's form for nothing.
        render(<Host />);

        expect(screen.getByRole("button", { name: "Auto-format" })).toBeDisabled();
    });

    it("re-formats the current language when Beautify is used", async () => {
        render(<Host initialValue='{"a":{"b":1}}' />);

        await clickButton("Auto-format");

        expect(hostValue()).toBe(CANONICAL_JSON);
        expect(displayedText()).toBe(CANONICAL_JSON);
    });

    it("reports an Auto-format as exactly one change", async () => {
        // The re-formatted text is both emitted directly and pushed into the editor, whose echo
        // must not emit it a second time — a caller hanging autosave off onChange would save twice.
        const onChange = vi.fn();
        render(<Host initialValue='{"a":{"b":1}}' onChange={onChange} />);

        await clickButton("Auto-format");

        expect(onChange).toHaveBeenCalledTimes(1);
        expect(onChange).toHaveBeenCalledWith(CANONICAL_JSON);
    });

    it("inserts at the cursor and reports the result", async () => {
        render(<Host initialValue='{"a":1}' />);

        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        // The caret starts at the top of the document, so the token lands there.
        expect(displayedText()).toBe('INSERTED{"a":1}');
        expect(hostValue()).toBe('INSERTED{"a":1}');
    });

    it("moves the cursor to the end when the value is replaced from outside", async () => {
        // Without this, the stale cursor is only clamped to the new length, so a variable inserted
        // straight after applying an example lands at the very start and breaks the document.
        render(<Host initialValue='{"a":1}' />);

        await userEvent.click(screen.getByTestId("replace-value"));
        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        expect(displayedText()).toBe('{\n    "example": true\n}INSERTED');
    });

    it("keeps the running editor across a language switch that leaves the text unchanged", async () => {
        // An unprojectable draft passes through a switch byte-identical; remounting anyway would
        // reset the caret to the start and discard the undo history for no reason.
        render(<Host initialValue='{"broken":' insertToken="A" />);
        const editorBefore = document.querySelector(".cm-editor");

        await clickLanguage("YAML");

        expect(document.querySelector(".cm-editor")).toBe(editorBefore);
    });

    it("does not move the cursor after a language switch that left the text unchanged", async () => {
        // An unprojectable value passes through a language switch verbatim, so the draft does not
        // change and the pending cursor reset must not stay armed — it would fire on the user's
        // next edit and yank the caret to the end of the document.
        render(<Host initialValue='{"broken":' insertToken="A" />);

        await clickLanguage("YAML");
        // Two inserts at the (remounted) editor's start: if the stale reset fired after the first
        // one, the second would land at the end of the document instead of after the first.
        await userEvent.click(screen.getByTestId("insert-at-cursor"));
        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        expect(displayedText()).toBe('AA{"broken":');
    });

    it("undoes an edit with the keyboard", async () => {
        // historyKeymap binds Mod-z, but without the history() state extension the command has
        // nothing to operate on — the textarea this editor replaced had native undo.
        render(<Host initialValue='{"a":1}' />);

        await userEvent.click(screen.getByTestId("insert-at-cursor"));
        expect(displayedText()).toBe('INSERTED{"a":1}');

        fireEvent.keyDown(document.querySelector(".cm-content")!, { key: "z", ctrlKey: true });

        expect(displayedText()).toBe('{"a":1}');
        expect(hostValue()).toBe('{"a":1}');
    });

    it("ignores keyboard editing commands while read-only", () => {
        // contenteditable=false blocks typing, but keymap commands like Enter consult
        // EditorState.readOnly — without it a focused read-only editor still mutates.
        const onChange = vi.fn();
        render(<Host readOnly onChange={onChange} />);
        const content = document.querySelector(".cm-content")!;

        fireEvent.keyDown(content, { key: "Enter" });
        fireEvent.keyDown(content, { key: "Backspace" });

        expect(displayedText()).toBe(CANONICAL_JSON);
        expect(onChange).not.toHaveBeenCalled();
    });

    it("refuses to insert at the cursor when not editable", async () => {
        // CodeMirror's non-editable state only blocks user input, so a programmatic insert has to be
        // refused explicitly or a read-only editor could still be rewritten through the handle.
        render(<Host readOnly />);

        await userEvent.click(screen.getByTestId("insert-at-cursor"));

        expect(displayedText()).toBe(CANONICAL_JSON);
        expect(hostValue()).toBe(CANONICAL_JSON);
    });

    it("keeps the value readable but not editable when read-only", () => {
        render(<Host readOnly />);

        expect(document.querySelector(".cm-content")).toHaveAttribute("contenteditable", "false");
        // Looking at the value in another language is still allowed.
        expect(screen.getByRole("radio", { name: "YAML" })).not.toBeDisabled();
        expect(screen.getByRole("button", { name: "Auto-format" })).toBeDisabled();
    });

    it("blocks the whole toolbar while disabled", () => {
        render(<Host disabled />);

        expect(document.querySelector(".cm-content")).toHaveAttribute("contenteditable", "false");
        expect(screen.getByRole("radio", { name: "JSON" })).toBeDisabled();
        expect(screen.getByRole("radio", { name: "YAML" })).toBeDisabled();
        expect(screen.getByRole("button", { name: "Auto-format" })).toBeDisabled();
    });
    it("renders no language switcher for a non-JSON primary, whatever languages offers", () => {
        // YAML is a superset of JSON: an invalid JSON draft can be a valid YAML document, so a
        // pass-through emit out of a JSON projection could hand a YAML-validating host text the
        // user never saw validated. The projection is therefore not offered.
        render(
            <UiConfigEditor
                value="a: 1"
                onChange={vi.fn()}
                primaryLanguage="yaml"
                languages={["yaml", "json"]}
                language="yaml"
                onLanguageChange={vi.fn()}
            />,
        );

        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("keeps a single-language configuration in the primary language, whatever it offers", () => {
        // languages={["yaml"]} with a JSON primary passes the membership check, but a one-entry
        // list renders no switcher — honoring it would trap the user in a projection.
        render(
            <UiConfigEditor
                value={CANONICAL_JSON}
                onChange={vi.fn()}
                languages={["yaml"]}
                language="yaml"
                onLanguageChange={vi.fn()}
            />,
        );

        expect(displayedText()).toBe(CANONICAL_JSON);
    });

    it("names the editor even when no label is supplied", () => {
        render(<UiConfigEditor value={CANONICAL_JSON} onChange={vi.fn()} />);

        expect(document.querySelector(".cm-content")).toHaveAttribute("aria-label", "Code editor");
    });

    it("ignores a controlled display language that is not among the offered ones", () => {
        // A shared, persisted language preference must not trap a single-language editor in a
        // projection it offers no way out of.
        render(
            <UiConfigEditor
                value={CANONICAL_JSON}
                onChange={vi.fn()}
                languages={["json"]}
                language="yaml"
                onLanguageChange={vi.fn()}
            />,
        );

        expect(displayedText()).toBe(CANONICAL_JSON);
    });

    it("remounts on a language switch when a completion source is wired", async () => {
        // Completion wiring is mount-only and per-language; keeping the instance across the switch
        // would leave the old language's completion behavior active.
        render(<Host initialValue='{"broken":' completionSource={() => null} />);
        const editorBefore = document.querySelector(".cm-editor");

        await clickLanguage("YAML");

        expect(document.querySelector(".cm-editor")).not.toBe(editorBefore);
    });

    it("ignores a controlled display language when the primary is not JSON", () => {
        // The switcher gate alone would not stop a caller passing language="json" directly; the
        // display derivation itself must refuse, or the unsound projection returns by another door.
        render(
            <UiConfigEditor
                value="a: 1"
                onChange={vi.fn()}
                primaryLanguage="yaml"
                languages={["yaml"]}
                language={"json" as ConfigEditorLanguage}
                onLanguageChange={vi.fn()}
            />,
        );

        expect(displayedText()).toBe("a: 1");
    });

    it("renders no language switcher without a controlled language to make selections effective", () => {
        // With onLanguageChange but no language prop, a selection could never change the editor —
        // the radios would appear to accept it and snap straight back.
        render(<UiConfigEditor value={CANONICAL_JSON} onChange={vi.fn()} onLanguageChange={vi.fn()} />);

        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("renders no language switcher when there is no way to report a selection", () => {
        // Radios that cannot change anything are worse than none: the editor is controlled, so
        // without onLanguageChange a selection could never be honored.
        render(<UiConfigEditor value={CANONICAL_JSON} onChange={vi.fn()} language="json" />);

        expect(screen.queryByRole("radio")).not.toBeInTheDocument();
    });

    it("names the language switcher even when no label is supplied", () => {
        render(<Host />);

        expect(screen.getByRole("radiogroup", { name: "Editor language" })).toBeInTheDocument();
    });

    it("names the context-menu button even when no label is supplied", async () => {
        // The button is icon-only; without a fallback accessible name it would be anonymous to
        // assistive technology whenever a caller supplies the menu but omits the label.
        render(<Host renderContextMenu={({ ariaAttributes }) => <div {...ariaAttributes} role="menu" />} />);

        expect(screen.getByRole("button", { name: "More actions" })).toBeInTheDocument();
    });

    describe("single-language YAML mode", () => {
        // A hand-annotated document, the way the catalog's as-code serializers produce them.
        const ANNOTATED_YAML = "# identity\nid: metric_1\n\ntitle: Revenue\n";

        /** The catalog shape: YAML in, YAML out, no other language on offer. */
        function YamlHost({
            initialValue = ANNOTATED_YAML,
            onChange,
        }: {
            initialValue?: string;
            onChange?: (next: string) => void;
        }) {
            const [value, setValue] = useState(initialValue);
            const apiRef = useRef<IUiConfigEditorApi>(null);

            return (
                <div>
                    <pre data-testid="host-value">{value}</pre>
                    <button
                        onClick={() => apiRef.current?.insertAtCursor("INSERTED")}
                        data-testid="insert-at-cursor"
                    >
                        insert
                    </button>
                    <UiConfigEditor
                        value={value}
                        onChange={(next) => {
                            onChange?.(next);
                            setValue(next);
                        }}
                        primaryLanguage="yaml"
                        languages={["yaml"]}
                        editorRef={apiRef}
                        label="Definition"
                    />
                </div>
            );
        }

        it("renders no language switcher", () => {
            render(<YamlHost />);

            expect(screen.queryByRole("radio")).not.toBeInTheDocument();
            expect(displayedText()).toBe(ANNOTATED_YAML);
        });

        it("emits edits verbatim, never converting them", async () => {
            // The property the as-code editors rely on: comments and formatting reach the host byte
            // for byte, because a single-language editor has no conversion step at all.
            render(<YamlHost />);

            await userEvent.click(screen.getByTestId("insert-at-cursor"));

            expect(hostValue()).toBe(`INSERTED${ANNOTATED_YAML}`);
            expect(hostValue()).toBe(displayedText());
        });

        it("re-formats YAML in place, keeping its comments", async () => {
            render(<YamlHost initialValue={"# identity\nid:      metric_1\n"} />);

            await clickButton("Auto-format");

            expect(hostValue()).toBe("# identity\nid: metric_1\n");
            expect(displayedText()).toBe("# identity\nid: metric_1\n");
        });
    });

    describe("context menu", () => {
        it("renders no menu button unless a caller supplies the menu", () => {
            render(<Host />);

            expect(screen.queryByRole("button", { name: "More actions" })).not.toBeInTheDocument();
        });

        it("opens the caller's menu from the toolbar button", async () => {
            render(
                <Host
                    labels={{ contextMenu: "More actions" }}
                    renderContextMenu={({ ariaAttributes }) => (
                        <div {...ariaAttributes} role="menu">
                            <button role="menuitem">Insert variable</button>
                        </div>
                    )}
                />,
            );
            const trigger = screen.getByRole("button", { name: "More actions" });
            expect(trigger).toHaveAttribute("aria-expanded", "false");
            expect(screen.queryByRole("menu")).not.toBeInTheDocument();

            await userEvent.click(trigger);

            expect(screen.getByRole("menuitem", { name: "Insert variable" })).toBeInTheDocument();
            expect(screen.getByRole("button", { name: "More actions" })).toHaveAttribute(
                "aria-expanded",
                "true",
            );
        });

        it("names the menu after the button that opened it", async () => {
            render(
                <Host
                    labels={{ contextMenu: "More actions" }}
                    renderContextMenu={({ ariaAttributes }) => <div {...ariaAttributes} role="menu" />}
                />,
            );
            const trigger = screen.getByRole("button", { name: "More actions" });

            await userEvent.click(trigger);

            // One menu only: the positioning wrapper must not claim the role too.
            const menu = screen.getByRole("menu");
            expect(menu).toHaveAttribute("aria-labelledby", trigger.id);
            expect(trigger).toHaveAttribute("aria-controls", menu.id);
        });

        it("lets the menu close itself after an action", async () => {
            render(
                <Host
                    labels={{ contextMenu: "More actions" }}
                    renderContextMenu={({ onClose, ariaAttributes }) => (
                        <div {...ariaAttributes} role="menu">
                            <button role="menuitem" onClick={onClose}>
                                Pick me
                            </button>
                        </div>
                    )}
                />,
            );

            await userEvent.click(screen.getByRole("button", { name: "More actions" }));
            await userEvent.click(screen.getByRole("menuitem", { name: "Pick me" }));

            expect(screen.queryByRole("menu")).not.toBeInTheDocument();
        });

        it("blocks the menu button while disabled", () => {
            render(
                <Host
                    disabled
                    labels={{ contextMenu: "More actions" }}
                    renderContextMenu={({ ariaAttributes }) => <div {...ariaAttributes} role="menu" />}
                />,
            );

            expect(screen.getByRole("button", { name: "More actions" })).toBeDisabled();
        });
    });
});
