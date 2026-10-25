// (C) 2007-2026 GoodData Corporation

import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { loadShortcutDateDatasets } from "../actions/shortcuts_actions.js";
import { shortcutsSelector } from "../selectors/shortcuts_selector.js";
import { withDragDrop } from "../utils/with_drag_drop_context.js";
import { withIntl } from "../utils/with_intl.js";
import { withRedux } from "../utils/with_redux.js";

import { Shortcuts } from "./Shortcuts.js";

vi.hoisted(() => {
    vi.resetModules();
});

const useSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: unknown) => useSelectorMock(selector),
        useDispatch: () => dispatchMock,
    };
});

describe("Shortcuts", () => {
    const activeDragItem = { title: "test", type: "metric" };
    const WrappedShortcuts = withDragDrop(withRedux(withIntl(Shortcuts)));

    function setSelectorValues(values = {}) {
        const shortcutsState = {
            activeDragItem,
            displayBlock: false,
            displayAttribute: false,
            displayMetric: false,
            displayMetricOverTime: false,
            isMetricOverTimeDisabled: false,
            ...values,
        };

        useSelectorMock.mockImplementation((selector: unknown) =>
            selector === shortcutsSelector ? shortcutsState : undefined,
        );
    }

    function renderComponent(values = {}) {
        setSelectorValues(values);
        return render(<WrappedShortcuts />);
    }

    beforeEach(() => {
        useSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    it("should be in blank state by default", () => {
        const { container } = renderComponent();
        expect(container.querySelectorAll(".adi-shortcuts-area")).toHaveLength(0);
    });

    it("should show empty container", () => {
        const { container } = renderComponent({
            displayBlock: true,
        });
        expect(container.querySelectorAll(".adi-shortcuts-area")).toHaveLength(1);
    });

    it("should show Attribute shortcut", () => {
        const { container } = renderComponent({
            displayBlock: true,
            displayAttribute: true,
        });
        expect(container.querySelectorAll(".adi-shortcuts-area")).toHaveLength(1);
        expect(container.querySelectorAll(".s-recommendation-attribute-canvas")).toHaveLength(1);
    });

    it("should show Metric shortcut", () => {
        const { container } = renderComponent({
            displayBlock: true,
            displayMetric: true,
        });
        expect(container.querySelectorAll(".adi-shortcuts-area")).toHaveLength(1);
        expect(container.querySelectorAll(".s-recommendation-metric-canvas")).toHaveLength(1);
    });

    describe("triggering load of date datasets", () => {
        it("should trigger load if dragged metric", () => {
            renderComponent();
            expect(dispatchMock).toHaveBeenCalledWith(loadShortcutDateDatasets());
        });

        it("should trigger load if dragged fact", () => {
            renderComponent({
                activeDragItem: { type: "fact" },
            });
            expect(dispatchMock).toHaveBeenCalledWith(loadShortcutDateDatasets());
        });

        it("should not trigger load if dragged something else", () => {
            renderComponent({
                activeDragItem: { type: "attribute" },
            });
            expect(dispatchMock).not.toHaveBeenCalled();
        });
    });
});
