// (C) 2026 GoodData Corporation

import { render, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";

import { preloadUiConfigEditorGrammars } from "@gooddata/sdk-ui-kit";

import { TestIntlProvider } from "../localization/TestIntlProvider.js";
import { validateParameterYaml } from "../parameter/parameterValidation.js";

import { AsCodeEditorBody } from "./AsCodeEditorBody.js";
import type { AsCodeValidation, IAsCodeEditing } from "./descriptor.js";

beforeAll(() => preloadUiConfigEditorGrammars());

const editing: IAsCodeEditing<unknown> = {
    completionSource: () => null,
    syntaxErrorMessage: "YAML syntax error",
    serialize: () => {
        throw new Error("not used");
    },
    reconcile: (definition) => definition,
    validate(value): AsCodeValidation<unknown> {
        const result = validateParameterYaml(value, { enabledTypes: ["NUMBER"] });
        return result.isValid
            ? { isValid: true, definition: result.parameter }
            : { isValid: false, error: result.errorCode, path: result.path, target: result.target };
    },
};

function markedText(container: HTMLElement): string[] {
    return Array.from(container.querySelectorAll(".cm-lintRange-error"), (range) => range.textContent ?? "");
}

describe("AsCodeEditorBody inline diagnostics", () => {
    it("marks the field the validation points at", async () => {
        const { container } = render(
            <AsCodeEditorBody
                initialValue={
                    "definition:\n  type: NUMBER\n  defaultValue: 10\n  constraints:\n    min: 100\n    max: 10\n"
                }
                onChange={vi.fn()}
                disabled={false}
                editing={editing}
                validationContext={{ intent: "create" }}
                label="Definition"
            />,
            { wrapper: TestIntlProvider },
        );

        // Waits out the editor's 750 ms lint delay with room to spare.
        await waitFor(() => expect(markedText(container)).toEqual(["min: 100", "    max: 10"]), {
            timeout: 3000,
        });
    });

    it("marks the key of an unknown field that has no value", async () => {
        const { container } = render(
            <AsCodeEditorBody
                initialValue={"definition:\n  type: NUMBER\n  defaultValue: 10\nfoo:\n"}
                onChange={vi.fn()}
                disabled={false}
                editing={editing}
                validationContext={{ intent: "create" }}
                label="Definition"
            />,
            { wrapper: TestIntlProvider },
        );

        await waitFor(() => expect(markedText(container)).toEqual(["foo"]), { timeout: 3000 });
    });

    it("does not validate a read-only document", () => {
        const validate = vi.spyOn(editing, "validate");
        render(
            <AsCodeEditorBody
                readOnly
                initialValue={"definition:\n  type: STRING\n"}
                onChange={vi.fn()}
                disabled={false}
                editing={editing}
                validationContext={{ intent: "create" }}
                label="Definition"
            />,
            { wrapper: TestIntlProvider },
        );

        expect(validate).not.toHaveBeenCalled();
    });
});
