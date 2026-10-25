// (C) 2026 GoodData Corporation

import { render, screen } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type IExecutionResultLimitBreak, newInsightDefinition } from "@gooddata/sdk-model";

import { showDialogExportCsv } from "../../actions/export_report_actions.js";
import { LOCAL_TABLE } from "../../constants/visualization_types.js";
import { getInsightForRawExport } from "../../selectors/insight_selectors.js";
import { getExecutionLimitBreaks } from "../../selectors/report_selector.js";
import { withIntl } from "../../utils/with_intl.js";

import { PartialDataWarning } from "./PartialDataWarning.js";

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

const insight = newInsightDefinition(LOCAL_TABLE);

beforeEach(() => {
    useSelectorMock.mockReset();
    dispatchMock.mockReset();
});

function renderComponent(
    customState: { limitBreaks?: IExecutionResultLimitBreak[] } = {},
): ReturnType<typeof render> {
    const Wrapped = withIntl(PartialDataWarning);
    const limitBreaks = customState.limitBreaks ?? [{ limitType: "xtab-rows", limit: 60000, value: 70000 }];

    useSelectorMock.mockImplementation((selector: unknown) => {
        if (selector === getInsightForRawExport) {
            return insight;
        }
        if (selector === getExecutionLimitBreaks) {
            return limitBreaks;
        }
        return undefined;
    });

    return render(<Wrapped />);
}

describe("PartialDataWarning", () => {
    it("renders known row and column limit break detail", async () => {
        renderComponent({
            limitBreaks: [
                { limitType: "xtab-rows", limit: 60000, value: 80000 },
                { limitType: "xtab-columns", limit: 1000, value: 1020 },
            ],
        });

        expect(screen.getByText("Partial results only.")).toBeInTheDocument();
        expect(screen.queryByText(/The result exceeds both/)).not.toBeInTheDocument();

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText(
                "The result exceeds both the 1,000 columns and the 60K row limit by 20 columns and 20K rows.",
            ),
        ).toBeInTheDocument();
    });

    it("renders combined row and column detail without overflow when the column total is unknown", async () => {
        renderComponent({
            limitBreaks: [
                { limitType: "xtab-rows", limit: 60000, value: 80000 },
                { limitType: "xtab-columns", limit: 1000 },
            ],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText("The result exceeds both the 1,000 columns and the 60K row limit."),
        ).toBeInTheDocument();
    });

    it("renders combined row and column detail without overflow when the row total is unknown", async () => {
        renderComponent({
            limitBreaks: [
                { limitType: "xtab-rows", limit: 60000 },
                { limitType: "xtab-columns", limit: 1000, value: 1020 },
            ],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText("The result exceeds both the 1,000 columns and the 60K row limit."),
        ).toBeInTheDocument();
    });

    it("renders datapoint only detail for a visualization", async () => {
        renderComponent({
            limitBreaks: [{ limitType: "xtab-cells", limit: 60000, value: 70000 }],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText("Full result exceeds the 60K datapoint limit by 10K datapoints."),
        ).toBeInTheDocument();
    });

    it("renders combined column and cell detail", async () => {
        renderComponent({
            limitBreaks: [
                { limitType: "xtab-columns", limit: 1000, value: 1020 },
                { limitType: "xtab-cells", limit: 100000000, value: 100020000 },
            ],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText(
                "The result exceeds both the 1,000 columns and the 100M cell limit by 20 columns and 20K cells.",
            ),
        ).toBeInTheDocument();
    });

    it("renders combined column, cell and row detail", async () => {
        renderComponent({
            limitBreaks: [
                { limitType: "xtab-columns", limit: 1000, value: 1020 },
                { limitType: "xtab-cells", limit: 100000000, value: 100020000 },
                { limitType: "xtab-rows", limit: 60000, value: 80000 },
            ],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(
            screen.getByText(
                "The result exceeds the 1,000 columns the 100M cell and 60K row limit by 20 columns and 20K cells and 20K rows.",
            ),
        ).toBeInTheDocument();
    });

    it("renders unknown total detail without overflow", async () => {
        renderComponent({
            limitBreaks: [{ limitType: "rowCount", limit: 60000 }],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(screen.getByText("The result exceeds the 60K row limit.")).toBeInTheDocument();
    });

    it("renders unknown total detail when overflow is zero", async () => {
        renderComponent({
            limitBreaks: [{ limitType: "rowCount", limit: 60000, value: 60000 }],
        });

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));

        expect(screen.getByText("The result exceeds the 60K row limit.")).toBeInTheDocument();
        expect(screen.queryByText("The result exceeds the 60K row limit by 0 rows.")).not.toBeInTheDocument();
    });

    it("dismisses the warning", async () => {
        renderComponent();

        await userEvent.click(screen.getByRole("button", { name: "Dismiss partial data warning" }));

        expect(screen.queryByText("Partial results only.")).not.toBeInTheDocument();
    });

    it("shows export CSV dialog for raw export", async () => {
        renderComponent();

        await userEvent.click(screen.getByRole("button", { name: "Show details" }));
        await userEvent.click(screen.getByRole("link", { name: "Export full result as Raw (.csv)" }));

        expect(dispatchMock).toHaveBeenCalledTimes(1);
        expect(dispatchMock).toHaveBeenCalledWith(showDialogExportCsv("raw"));
    });
});
