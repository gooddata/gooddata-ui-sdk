// (C) 2007-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { Provider } from "react-redux";
import { type Store } from "redux";
import { describe, expect, it, vi } from "vitest";

import { initialState } from "../../reducers/initial_state.js";
import { type IAppState } from "../../store/types.js";
import { withAppState } from "../../tests/state_builder.test.helpers.js";

import { type ISimpleBucketItemHeaderProps, SimpleBucketItemHeader } from "./SimpleBucketItemHeader.js";

/**
 * A read-only store over a hand-built state. Mocking react-redux instead would leak the mocked
 * module into every other test file through the shared module cache, because the suite runs with
 * test isolation turned off.
 */
function createTestStore(isRenamingBucketItem: boolean) {
    const state = withAppState(initialState, { renamingBucketItem: isRenamingBucketItem });

    const store: Store<IAppState> = {
        getState: () => state,
        subscribe: () => () => {},
        dispatch: vi.fn(),
        replaceReducer: vi.fn(),
        [Symbol.observable]: vi.fn(),
    };
    return store;
}

describe("SimpleBucketItemHeader", () => {
    function renderComponent(
        customProps?: Partial<ISimpleBucketItemHeaderProps>,
        { isRenamingBucketItem = false }: { isRenamingBucketItem?: boolean } = {},
    ) {
        return render(
            <Provider store={createTestStore(isRenamingBucketItem)}>
                <SimpleBucketItemHeader
                    localIdentifier={"a1"}
                    title={"Attribute Title"}
                    type={"attribute"}
                    className={"attributeIdClassName"}
                    isCollapsed={false}
                    onToggleCollapse={() => {}}
                    {...customProps}
                />
                <div id="confirm-typed-changes"></div>
            </Provider>,
        );
    }

    it("should render type and className correctly", () => {
        renderComponent();

        const componentWithType = document.querySelectorAll(".type-attribute");
        const componentWithClassName = document.querySelectorAll(".attributeIdClassName");

        expect(componentWithType).toHaveLength(1);
        expect(componentWithClassName).toHaveLength(1);
    });

    describe("attribute bucket item", () => {
        it("should be expanded", () => {
            renderComponent({
                type: "attribute",
            });
            expect(document.querySelectorAll(".configurable-attribute")).toHaveLength(1);
            expect(document.querySelectorAll(".expanded")).toHaveLength(1);
            expect(document.querySelectorAll(".collapsed")).toHaveLength(0);
        });

        it("should be collapsed when item is collapsed", () => {
            renderComponent({
                type: "attribute",
                isCollapsed: true,
            });
            expect(document.querySelectorAll(".configurable-attribute")).toHaveLength(1);
            expect(document.querySelectorAll(".collapsed")).toHaveLength(1);
            expect(document.querySelectorAll(".expanded")).toHaveLength(0);
        });
    });

    describe("title", () => {
        it("should render title when no alias", () => {
            renderComponent();
            const bucketItemTitle = document.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual("Attribute Title");
        });

        it("should render title when alias empty string", () => {
            renderComponent({
                alias: "",
            });
            const bucketItemTitle = document.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual("Attribute Title");
        });

        it("should render alias instead of title when alias not empty string", () => {
            const alias = "My Alias";
            renderComponent({
                alias,
            });
            const bucketItemTitle = document.querySelector(".gd-editable-label");

            expect(bucketItemTitle.textContent).toEqual(alias);
        });

        it("should pass original title as 'placeholder' prop into <EditableLabel />", () => {
            renderComponent({
                alias: "My Alias",
            });
            const editableLabel = document.querySelector(".s-rename-label");
            fireEvent.click(editableLabel);

            expect(document.querySelector("textarea")).toHaveAttribute("placeholder", "Attribute Title");
        });
    });

    describe("subtitle", () => {
        it("should render no subtitle when no alias", () => {
            renderComponent();
            const bucketItemSubtitle = document.querySelectorAll(".adi-bucket-item-sub-header");

            expect(bucketItemSubtitle).toHaveLength(0);
        });

        it("should render no subtitle when alias empty string", () => {
            renderComponent({
                alias: "",
            });
            const bucketItemSubtitle = document.querySelectorAll(".adi-bucket-item-sub-header");

            expect(bucketItemSubtitle).toHaveLength(0);
        });

        it("should render subtitle when alias non-empty string", () => {
            renderComponent({
                alias: "My Alias",
            });
            const bucketItemSubtitle = document.querySelector(".adi-bucket-item-sub-header");

            expect(bucketItemSubtitle.textContent).toEqual("Attribute Title");
        });
    });

    describe("renaming", () => {
        it('should NOT have "renaming" class when bucket item is in default state', () => {
            renderComponent();
            expect(document.querySelector(".s-bucket-item-header")).not.toHaveClass("renaming");
        });

        it('should NOT have "renaming" class when bucket item is NOT being renamed', () => {
            renderComponent({}, { isRenamingBucketItem: false });
            expect(document.querySelector(".s-bucket-item-header")).not.toHaveClass("renaming");
        });

        it('should have "renaming" class when bucket item is being renamed', () => {
            renderComponent({}, { isRenamingBucketItem: true });
            expect(document.querySelector(".s-bucket-item-header")).toHaveClass("renaming");
        });
    });
});
