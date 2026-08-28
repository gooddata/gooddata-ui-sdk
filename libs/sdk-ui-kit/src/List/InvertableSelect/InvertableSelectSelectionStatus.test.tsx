// (C) 2026 GoodData Corporation

import { render as testingLibraryRender } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it } from "vitest";

import { render } from "../../../test/render.js";

import { InvertableSelectStatus } from "./InvertableSelectSelectionStatus.js";

interface IItem {
    title: string;
}

const items: IItem[] = [{ title: "Alpha" }, { title: "Beta" }];
const getItemTitle = (item: IItem) => item.title;

function renderStatus(selectedItems: IItem[], isInverted: boolean) {
    return render(
        <InvertableSelectStatus
            selectedItems={selectedItems}
            getItemTitle={getItemTitle}
            isInverted={isInverted}
        />,
    );
}

/**
 * The status line is assembled from a translated phrase whose word order locales are free to change,
 * so these assertions pin the English rendering down to the non-breaking spaces and the emphasis -
 * the layout of the status bar depends on both.
 */
describe("InvertableSelectStatus", () => {
    it("renders 'is All' when everything is selected", () => {
        const { container } = renderStatus([], true);

        expect(container.textContent).toBe("\u00a0is\u00a0All");
        expect(container.querySelector("b")).toHaveTextContent("All");
    });

    it("renders 'is None' when nothing is selected", () => {
        const { container } = renderStatus([], false);

        expect(container.textContent).toBe("\u00a0is\u00a0None");
        expect(container.querySelector("b")).toHaveTextContent("None");
    });

    it("renders 'is <selection> (count)' for a positive selection", () => {
        const { container } = renderStatus(items, false);

        expect(container.textContent).toBe("\u00a0is\u00a0Alpha, Beta\u00a0(2)");
        expect(container.querySelector(".s-dropdown-attribute-selection-list")).toHaveTextContent(
            "Alpha, Beta",
        );
    });

    it("renders 'is not <selection> (count)' for a negative selection", () => {
        const { container } = renderStatus(items, true);

        expect(container.textContent).toBe("\u00a0is not\u00a0Alpha, Beta\u00a0(2)");
    });

    /**
     * A locale is free to put the values first and the connective words last - Japanese does exactly
     * that ("すべてを選択中"). These use a synthetic bundle rather than the shipped ja-JP one on purpose:
     * the point is that the placeholder mechanism allows the reorder, and asserting on real
     * translations would make a Crowdin reword fail the build. The shipped wording is the
     * translators' to change.
     */
    describe("with a reordered translation", () => {
        const MESSAGES = {
            "gs.list.selectionStatus.all": "<b>every one</b> chosen",
            "gs.list.selectionStatus.none": "<b>nothing chosen</b>",
            "gs.list.selectionStatus.is": "{selection} chosen",
            "gs.list.selectionStatus.isNot": "all but {selection} chosen",
        };

        function renderReordered(selectedItems: IItem[], isInverted: boolean) {
            return testingLibraryRender(
                <IntlProvider locale="en-US" messages={MESSAGES}>
                    <InvertableSelectStatus
                        selectedItems={selectedItems}
                        getItemTitle={getItemTitle}
                        isInverted={isInverted}
                    />
                </IntlProvider>,
            );
        }

        it("keeps the emphasis on the value when the phrase ends with the verb", () => {
            const { container } = renderReordered([], true);

            expect(container.textContent).toBe("every one\u00a0chosen");
            expect(container.querySelector("b")).toHaveTextContent("every one");
        });

        it("renders a phrase that is a single word", () => {
            const { container } = renderReordered([], false);

            expect(container.textContent).toBe("nothing chosen");
        });

        it("puts the trailing words after the selection", () => {
            const { container } = renderReordered(items, false);

            expect(container.textContent).toBe("Alpha, Beta\u00a0(2)\u00a0chosen");
        });

        it("wraps the selection in a phrase with words on both sides", () => {
            const { container } = renderReordered(items, true);

            expect(container.textContent).toBe("all\u00a0but\u00a0Alpha, Beta\u00a0(2)\u00a0chosen");
        });
    });
});
