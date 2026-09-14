// (C) 2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { describe, expect, it, vi } from "vitest";

import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "@gooddata/sdk-ui";

import { type IUiMenuItem } from "./types.js";
import { UiMenu } from "./UiMenu.js";

/**
 * A submenu rendered as UiMenu custom content can host a rich text editor (a drill-to-URL editor, a
 * MAQL editor). Such an editor puts the caret in a contenteditable rather than in a form control,
 * and its own arrow keys must not reach the menu: ArrowLeft there means "move the caret", not
 * "leave this submenu".
 */
describe("UiMenu custom content keyboard handling", () => {
    const messages = DEFAULT_MESSAGES[DEFAULT_LANGUAGE];

    function renderMenuWithContent(editor: ReactNode) {
        const items: IUiMenuItem[] = [
            {
                type: "content",
                id: "content1",
                stringTitle: "Interactions",
                data: undefined,
                Component: () => <div data-testid="custom-content">{editor}</div>,
            },
        ];

        const result = render(
            <IntlProvider key="en-US" locale="en-US" messages={messages}>
                <UiMenu
                    items={items}
                    onSelect={vi.fn()}
                    onClose={vi.fn()}
                    ariaAttributes={{
                        id: "test-menu",
                        "aria-labelledby": "test-button",
                    }}
                />
            </IntlProvider>,
        );

        // open the custom content submenu
        fireEvent.click(screen.getByText("Interactions"));

        return result;
    }

    it("keeps the submenu open when ArrowLeft is pressed inside a contenteditable editor", () => {
        renderMenuWithContent(
            <div contentEditable data-testid="editor" suppressContentEditableWarning>
                <span data-testid="editor-line">https://example.com</span>
            </div>,
        );

        const content = screen.getByTestId("custom-content");
        screen.getByTestId("editor").focus();

        fireEvent.keyDown(content, { code: "ArrowLeft" });

        expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });

    it("leaves the submenu when ArrowLeft is pressed outside any text entry", () => {
        renderMenuWithContent(<button data-testid="editor">Not an editor</button>);

        const content = screen.getByTestId("custom-content");
        screen.getByTestId("editor").focus();

        fireEvent.keyDown(content, { code: "ArrowLeft" });

        expect(screen.queryByTestId("custom-content")).not.toBeInTheDocument();
    });
});
