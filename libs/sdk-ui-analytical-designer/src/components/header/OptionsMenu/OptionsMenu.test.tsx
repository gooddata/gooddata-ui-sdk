// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import { fireEvent, render, renderHook } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { Provider } from "react-redux";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
    showDialogExportCsv,
    showDialogExportPdf,
    showDialogExportReport,
} from "../../../actions/export_report_actions.js";
import { createStore } from "../../../create_store.js";
import {
    type AnalyticalDesignerOptionsItem,
    type IAnalyticalDesignerHeaderContext,
} from "../../../embedding/editorHeaderSlotTypes.js";
import {
    supportsExportToCsv,
    supportsExportToXlsx,
} from "../../../selectors/backend_capabilities_selector.js";
import { isOpenInAnalyticalDesignerVisible } from "../../../selectors/editor_header_selector.js";
import { enableRawExports, isEnableTimezoneChange } from "../../../selectors/feature_flag_selector.js";
import {
    getExportVisible,
    getIsExportCSVDisabled,
    getIsExportCSVRawDisabled,
    getIsExportPDFDisabled,
    getIsExportXLSXDisabled,
    isTableVisualization,
} from "../../../selectors/options_menu_selector.js";
import { hasPartialDataLimitBreaks } from "../../../selectors/report_selector.js";
import { getIntlOptions } from "../../../utils/with_intl.js";
import { type useGuardedCallback } from "../editorHeaderContext.js";

import { OptionsMenu } from "./OptionsMenu.js";
import { normalizeOptionsItems, useOptionsProps } from "./useOptionsProps.js";

vi.hoisted(() => {
    vi.resetModules();
});

// Selector values a test forces; every other selector reads the real store.
const selectorOverrides = vi.hoisted(() => new Map<unknown, unknown>());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    const { useSelector: useActualSelector } = actual as {
        useSelector: (selector: (state: unknown) => unknown) => unknown;
    };
    return {
        ...actual,
        useSelector: (selector: (state: unknown) => unknown) => {
            const value = useActualSelector(selector);
            return selectorOverrides.has(selector) ? selectorOverrides.get(selector) : value;
        },
    };
});

// Lets every guarded callback run, for a test of what an action starts rather than of when it is refused.
const guards = vi.hoisted(() => ({ allowAll: false }));

vi.mock("../editorHeaderContext.js", async (importOriginal) => {
    const actual = await importOriginal<{ useGuardedCallback: typeof useGuardedCallback }>();
    return {
        ...actual,
        useGuardedCallback: ((isAllowed, run) =>
            actual.useGuardedCallback(
                guards.allowAll ? () => true : isAllowed,
                run,
            )) as typeof useGuardedCallback,
    };
});

afterAll(() => {
    // Drop this file's mocks from the shared (isolate:false) registry so they do not leak into sibling files.
    vi.resetModules();
});

const action = (
    id: string,
    patch: Partial<AnalyticalDesignerOptionsItem> = {},
): AnalyticalDesignerOptionsItem =>
    ({
        type: "action",
        id,
        label: id,
        isDisabled: false,
        onSelect: vi.fn(),
        ...patch,
    }) as AnalyticalDesignerOptionsItem;
const section = (id: string): AnalyticalDesignerOptionsItem => ({ type: "section", id, label: id });
const separator = (id: string): AnalyticalDesignerOptionsItem => ({ type: "separator", id });

const ids = (items: readonly AnalyticalDesignerOptionsItem[]) => items.map((item) => item.id);

describe("normalizeOptionsItems", () => {
    it("keeps a section followed by an action", () => {
        expect(ids(normalizeOptionsItems([section("s"), action("a")]))).toEqual(["s", "a"]);
    });

    it("drops sections with no action after them", () => {
        expect(
            ids(normalizeOptionsItems([section("empty"), section("s"), action("a"), section("trailing")])),
        ).toEqual(["s", "a"]);
        expect(ids(normalizeOptionsItems([section("s"), separator("sep"), action("a")]))).toEqual(["a"]);
    });

    it("drops leading, trailing and repeated separators", () => {
        expect(
            ids(
                normalizeOptionsItems([
                    separator("lead"),
                    action("a"),
                    separator("one"),
                    separator("two"),
                    action("b"),
                    separator("trail"),
                ]),
            ),
        ).toEqual(["a", "one", "b"]);
    });
});

describe("OptionsMenu", () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    function renderMenu(items: AnalyticalDesignerOptionsItem[], onClose = vi.fn()) {
        render(
            <IntlProvider {...getIntlOptions()}>
                <OptionsMenu items={items} onClose={onClose} />
            </IntlProvider>,
        );
        return onClose;
    }

    it("keeps the class names of the built-in actions", () => {
        renderMenu([action("exportXlsx"), action("exportCsvRaw"), action("changeTimezone")]);
        expect(document.querySelector(".gd-export-options-xlsx")).toBeInTheDocument();
        expect(document.querySelector(".gd-export-options-csv-raw")).toBeInTheDocument();
        expect(document.querySelector(".s-options-menu-timezone")).toBeInTheDocument();
    });

    it("closes the menu and starts the selected action", () => {
        const item = action("custom:audit", { label: "Audit" });
        const onClose = renderMenu([item]);

        fireEvent.click(document.querySelector(".s-options-menu-item-custom-audit"));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect((item as { onSelect: () => void }).onSelect).toHaveBeenCalledTimes(1);
    });

    it("does not start a disabled action and explains why", () => {
        const item = action("exportPdf", { isDisabled: true, disabledTooltip: "Too large" });
        renderMenu([item]);

        const element = document.querySelector(".gd-export-options-pdf");
        fireEvent.click(element);

        expect(element).toHaveClass("is-disabled");
        expect(element.closest(".s-gd-bubble-trigger-options-menu-item")).toBeTruthy();
        expect((item as { onSelect: () => void }).onSelect).not.toHaveBeenCalled();
    });
});

describe("useOptionsProps", () => {
    const context: IAnalyticalDesignerHeaderContext = {
        layout: { mode: "legacy", isCatalogCollapsed: false, canCollapseCatalog: false },
        workspace: "workspace",
        title: "",
        hasUnsavedChanges: false,
    };

    beforeEach(() => {
        guards.allowAll = false;
        selectorOverrides.clear();
        [
            [getExportVisible, true],
            [supportsExportToXlsx, true],
            [supportsExportToCsv, true],
            [isTableVisualization, true],
            [getIsExportXLSXDisabled, false],
            [getIsExportPDFDisabled, false],
            [getIsExportCSVDisabled, false],
            [getIsExportCSVRawDisabled, false],
            [enableRawExports, false],
            [hasPartialDataLimitBreaks, false],
            [isEnableTimezoneChange, false],
            [isOpenInAnalyticalDesignerVisible, false],
        ].forEach(([selector, value]) => selectorOverrides.set(selector, value));
    });

    function renderOptions(onChangeTimezone = vi.fn()) {
        const { store } = createStore();
        const dispatch = vi.spyOn(store, "dispatch");
        const wrapper = ({ children }: { children: ReactNode }) => (
            <Provider store={store}>
                <IntlProvider {...getIntlOptions()}>{children}</IntlProvider>
            </Provider>
        );
        const { items } = renderHook(() => useOptionsProps(context, onChangeTimezone), { wrapper }).result
            .current;
        return { items, dispatch };
    }

    const renderItems = (onChangeTimezone = vi.fn()) => renderOptions(onChangeTimezone).items;

    const byId = (items: readonly AnalyticalDesignerOptionsItem[], id: string) =>
        items.find((item) => item.id === id) as Extract<AnalyticalDesignerOptionsItem, { type: "action" }>;

    it("offers the exports under one section", () => {
        expect(ids(renderItems())).toEqual(["exportSection", "exportXlsx", "exportPdf", "exportCsv"]);
    });

    it("leaves the exports out when they are hidden", () => {
        selectorOverrides.set(getExportVisible, false);
        expect(renderItems()).toEqual([]);
    });

    it("splits CSV into formatted and raw with raw exports", () => {
        selectorOverrides.set(enableRawExports, true);
        const items = renderItems();
        expect(ids(items)).toEqual(["exportSection", "exportXlsx", "exportPdf", "exportCsv", "exportCsvRaw"]);
    });

    it("disables only the formatted exports for a partial result, with the reason", () => {
        selectorOverrides.set(enableRawExports, true);
        selectorOverrides.set(hasPartialDataLimitBreaks, true);
        const items = renderItems();

        expect(byId(items, "exportXlsx").isDisabled).toBe(true);
        expect(byId(items, "exportPdf").isDisabled).toBe(true);
        expect(byId(items, "exportCsv").isDisabled).toBe(true);
        expect(byId(items, "exportCsv").disabledTooltip).toBeTruthy();
        expect(byId(items, "exportCsvRaw").isDisabled).toBe(false);
    });

    it.each([
        ["exportXlsx", showDialogExportReport()],
        ["exportPdf", showDialogExportPdf()],
        ["exportCsv", showDialogExportCsv("formatted")],
        ["exportCsvRaw", showDialogExportCsv("raw")],
    ])("starts the dialog of %s", (id, expectedAction) => {
        guards.allowAll = true;
        selectorOverrides.set(enableRawExports, true);
        const { items, dispatch } = renderOptions();

        byId(items, id).onSelect();

        expect(dispatch).toHaveBeenCalledTimes(1);
        expect(dispatch).toHaveBeenCalledWith(expectedAction);
    });

    it("offers Open in Analytical Designer first when editing from a dashboard", () => {
        selectorOverrides.set(isOpenInAnalyticalDesignerVisible, true);
        expect(ids(renderItems())[0]).toBe("openInAnalyticalDesigner");
    });

    it("separates the time zone item, which opens the dialog of the header", () => {
        selectorOverrides.set(isEnableTimezoneChange, true);
        const onChangeTimezone = vi.fn();
        const items = renderItems(onChangeTimezone);

        expect(ids(items).slice(-2)).toEqual(["timezoneSeparator", "changeTimezone"]);
        byId(items, "changeTimezone").onSelect();
        expect(onChangeTimezone).toHaveBeenCalledTimes(1);
    });

    it("drops the time zone separator when it is the only item", () => {
        selectorOverrides.set(getExportVisible, false);
        selectorOverrides.set(isEnableTimezoneChange, true);
        expect(ids(renderItems())).toEqual(["changeTimezone"]);
    });
});
