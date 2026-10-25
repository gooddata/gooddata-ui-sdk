// (C) 2020-2026 GoodData Corporation

import { fireEvent, render } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import { saveReportCheck, saveReportFromKD } from "../../actions/save_actions.js";
import { withIntl } from "../../utils/with_intl.js";

import { SaveReportButton } from "./SaveReportButton.js";

vi.hoisted(() => {
    vi.resetModules();
});

const saveReportSelectorMock = vi.hoisted(() => vi.fn());
const dispatchMock = vi.hoisted(() => vi.fn());

vi.mock("react-redux", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("react-redux");
    return {
        ...actual,
        useSelector: (selector: (state: unknown) => unknown) => selector(undefined),
        useDispatch: () => dispatchMock,
    };
});

vi.mock("../../selectors/save_report_selector.js", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../../selectors/save_report_selector.js");
    return {
        ...actual,
        saveReportSelector: (state: unknown) => saveReportSelectorMock(state),
    };
});

afterAll(() => {
    // Drop this file's mocked selector (and react-redux mock) from the shared (isolate:false) registry
    // so they do not leak into sibling files that import the real ones
    // (e.g. selectors/save_report_selector.test.ts).
    vi.resetModules();
});

interface ISaveReportSelectorValues {
    isSaving: boolean;
    isDisabled: boolean;
    displaySaveInsightFromKDDialog: boolean;
    showDisabledTooltip: boolean;
}

describe("Test SaveReportButton", () => {
    function renderComponent(customValues: Partial<ISaveReportSelectorValues> = {}) {
        const values: ISaveReportSelectorValues = {
            isSaving: false,
            isDisabled: false,
            displaySaveInsightFromKDDialog: false,
            showDisabledTooltip: false,
            ...customValues,
        };
        saveReportSelectorMock.mockReturnValue(values);
        const Wrapped = withIntl(SaveReportButton);

        return render(<Wrapped />);
    }

    beforeEach(() => {
        saveReportSelectorMock.mockReset();
        dispatchMock.mockReset();
    });

    it("should render as expected", () => {
        const { getByText } = renderComponent();
        const button = getByText("Save");

        expect(button).toBeInTheDocument();
        expect(button.closest("button")).not.toHaveClass("disabled");

        fireEvent.click(button);

        expect(dispatchMock).toHaveBeenCalledWith(saveReportCheck(false));
    });

    it("should render disabled button", () => {
        const { getByText } = renderComponent({ isDisabled: true });
        const button = getByText("Save");

        expect(button).toBeInTheDocument();
        expect(button.closest("button")).toHaveClass("disabled");

        fireEvent.click(button);

        expect(dispatchMock).not.toHaveBeenCalled();
    });

    it("should change the button text when saving the report", () => {
        const { getByText } = renderComponent({ isSaving: true });
        const button = getByText("Saving…");

        expect(button).toBeInTheDocument();
    });

    it("should call the save report from kd when the shouldDisplaySaveInsightFromKDDialog is true", () => {
        const { getByText } = renderComponent({ displaySaveInsightFromKDDialog: true });
        const button = getByText("Save");

        fireEvent.click(button);

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(saveReportFromKD());
    });
});
