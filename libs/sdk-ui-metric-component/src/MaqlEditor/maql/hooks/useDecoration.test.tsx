// (C) 2007-2026 GoodData Corporation

import { act } from "@testing-library/react";
import { type MockInstance, beforeEach, describe, expect, it, vi } from "vitest";

import { type IDecoration, MaqlLanguageService } from "@gooddata/sdk-maql-language-server";

import { mountWithIntlApp } from "../../../tests/render.test.utils.js";
import { type IStandaloneCodeEditor } from "../../monaco/MonacoEditor.js";

import { useDecoration } from "./useDecoration.js";

describe("useHeaderData", () => {
    const service = new MaqlLanguageService();
    let decorate: (editor: IStandaloneCodeEditor) => void;

    function Range(startLine: number, startChar: number, endLine: number, endChar: number) {
        return {
            start: { line: startLine, character: startChar },
            end: { character: endLine, line: endChar },
        };
    }

    function Editor(value: string): IStandaloneCodeEditor {
        const collection = {
            onDidChange: undefined,
            clear: vi.fn(),
            set: vi.fn(),
            length: 0,
            append: vi.fn(),
            getRange: vi.fn(),
            getRanges: vi.fn(),
            has: vi.fn(),
        };

        return {
            getModel: () => {
                return {
                    getLanguageId: () => "modeId",
                    getVersionId: () => 1,
                    getValue: () => value,
                };
            },
            createDecorationsCollection: () => {
                return collection;
            },
        } as unknown as IStandaloneCodeEditor;
    }

    function wait(fn: MockInstance, count: number) {
        return new Promise((res) => {
            function w() {
                if (fn.mock.calls.length > count) {
                    res(undefined);
                    return;
                }
                setTimeout(w, 50);
            }
            w();
        });
    }

    function mountFakeComponent(hookFn: () => void) {
        function FakeComponent() {
            hookFn();
            return null;
        }

        mountWithIntlApp(<FakeComponent />);
    }

    async function mountAndGetData() {
        await act(async () => {
            mountFakeComponent(() => {
                decorate = useDecoration(service, true);
            });
            await new Promise((resolve) => setTimeout(resolve, 5));
        });
    }

    const setup = {
        maql: 'SELECT SUM({metric/test}) WHERE {attr/test} = "test"',
        decorations: [
            { range: Range(0, 11, 0, 24), options: { label: "Metric", type: "metric" } },
            { range: Range(0, 32, 0, 43), options: { label: "Attribute", type: "attribute" } },
        ],
    };

    beforeEach(() => {
        vi.spyOn(service, "doDecoration").mockImplementation(async function () {
            return setup.decorations as Array<IDecoration>;
        });
    });

    it("shod call deltaDecorations in right way", async () => {
        const editor = Editor(setup.maql);
        await mountAndGetData();

        const spy = vi.spyOn(editor, "createDecorationsCollection");

        decorate(editor);
        await wait(spy, 0);
        expect(spy).toHaveBeenCalledWith([]);
        expect(spy).toHaveReturned();
        await wait(editor.createDecorationsCollection().set as unknown as MockInstance, 0);
        expect(editor.createDecorationsCollection().set).toHaveBeenCalledWith([
            {
                options: {
                    before: {
                        content: " Metric ",
                        inlineClassName: "decorator metric",
                        inlineClassNameAffectsLetterSpacing: true,
                    },
                    hoverMessage: undefined,
                    inlineClassName: "decorator-item metric",
                },
                range: { endColumn: 1, endLineNumber: 25, startColumn: 12, startLineNumber: 1 },
            },
            {
                options: {
                    before: {
                        content: " Attribute ",
                        inlineClassName: "decorator attribute",
                        inlineClassNameAffectsLetterSpacing: true,
                    },
                    hoverMessage: undefined,
                    inlineClassName: "decorator-item attribute",
                },
                range: { endColumn: 1, endLineNumber: 44, startColumn: 33, startLineNumber: 1 },
            },
        ]);

        decorate(editor);
        await wait(spy, 0);
        await wait(editor.createDecorationsCollection().set as unknown as MockInstance, 1);
        expect(editor.createDecorationsCollection().set).toHaveBeenCalledWith([
            {
                options: {
                    before: {
                        content: " Metric ",
                        inlineClassName: "decorator metric",
                        inlineClassNameAffectsLetterSpacing: true,
                    },
                    hoverMessage: undefined,
                    inlineClassName: "decorator-item metric",
                },
                range: { endColumn: 1, endLineNumber: 25, startColumn: 12, startLineNumber: 1 },
            },
            {
                options: {
                    before: {
                        content: " Attribute ",
                        inlineClassName: "decorator attribute",
                        inlineClassNameAffectsLetterSpacing: true,
                    },
                    hoverMessage: undefined,
                    inlineClassName: "decorator-item attribute",
                },
                range: { endColumn: 1, endLineNumber: 44, startColumn: 33, startLineNumber: 1 },
            },
        ]);
    });
});
