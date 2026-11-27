// (C) 2026 GoodData Corporation

import { type MouseEvent } from "react";

import { fireEvent, render, screen } from "@testing-library/react";
import { IntlProvider } from "react-intl";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { useCurrentDataViewMock, usePivotTablePropsMock } from "../testing/contextMocks.test.helpers.js";
import { type ICorePivotTableNextProps } from "../types/internal.js";

import { TotalLabelProvider, useTotalLabelContext } from "./TotalLabelContext.js";

const { pushDataMock } = vi.hoisted(() => ({
    pushDataMock: vi.fn(),
}));

vi.mock("./PivotTablePropsContext.js", () => ({
    usePivotTableProps: usePivotTablePropsMock,
}));

vi.mock("./CurrentDataViewContext.js", () => ({
    useCurrentDataView: useCurrentDataViewMock,
}));

function OpenMenuButton() {
    const { openTotalLabelMenu } = useTotalLabelContext();

    const onClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        openTotalLabelMenu({
            anchor: event.currentTarget,
            type: "sum",
            attributeIdentifier: "row-attribute",
            bucketType: "attribute",
        });
    };

    return <button onClick={onClick}>Grand total</button>;
}

function bucketsWithAlias(alias: string | undefined) {
    return [
        {
            localIdentifier: "attribute",
            items: [],
            totals: [
                {
                    type: "sum",
                    attributeIdentifier: "row-attribute",
                    measureIdentifier: "measure",
                    ...(alias === undefined ? {} : { alias }),
                },
            ],
        },
    ];
}

function menuTree() {
    return (
        <IntlProvider
            locale="en-US"
            messages={{
                "visualizations.totals.dropdown.title.sum": "Sum",
                "visualizations.totals.labelActions.aria": "Total label actions",
                "visualizations.totals.renameLabel.action": "Rename label…",
                "visualizations.totals.resetLabel.action": "Reset to default",
                cancel: "Cancel",
                save: "Save",
            }}
        >
            <TotalLabelProvider>
                <OpenMenuButton />
            </TotalLabelProvider>
        </IntlProvider>
    );
}

function renderMenu() {
    const view = render(menuTree());

    fireEvent.click(screen.getByRole("button", { name: "Grand total" }));
    fireEvent.click(screen.getByText("Rename label…"));

    return view;
}

describe("TotalLabelProvider", () => {
    beforeEach(() => {
        pushDataMock.mockClear();
        usePivotTablePropsMock.mockReturnValue({
            config: { menu: { totalLabelsEditable: true } },
            execution: { definition: { buckets: bucketsWithAlias(undefined) } },
            pushData: pushDataMock,
        } as unknown as ICorePivotTableNextProps);
        // Mirrors `execution` - getCustomTotalLabel reads this, not execution (see
        // TotalLabelContext.tsx's own comment on why the two are kept in sync).
        useCurrentDataViewMock.mockReturnValue({
            currentDataView: { definition: { buckets: bucketsWithAlias(undefined) } },
        });
    });

    it("opens the action menu and transitions to the rename popover", () => {
        renderMenu();

        expect(document.querySelector(".s-rename-total-label-input")).toBeInTheDocument();

        fireEvent.change(document.querySelector(".s-rename-total-label-input input")!, {
            target: { value: "Grand Total" },
        });
        fireEvent.click(document.querySelector(".s-rename-total-save")!);

        expect(pushDataMock).toHaveBeenCalledWith({
            properties: {
                bucketType: "attribute",
                totals: [
                    {
                        type: "sum",
                        attributeIdentifier: "row-attribute",
                        measureIdentifier: "measure",
                        alias: "Grand Total",
                    },
                ],
            },
        });
        expect(screen.getByRole("button", { name: "Grand total" })).toHaveFocus();
    });

    it("prefills the rename popover from currentDataView, not execution, so it stays in sync with the row-total cell's own source", () => {
        usePivotTablePropsMock.mockReturnValue({
            config: { menu: { totalLabelsEditable: true } },
            // A prior rename already landed here (as it does the instant pushData is called), but
            // the data view hasn't re-executed with it yet.
            execution: { definition: { buckets: bucketsWithAlias("Stale execution alias") } },
            pushData: pushDataMock,
        } as unknown as ICorePivotTableNextProps);
        useCurrentDataViewMock.mockReturnValue({
            currentDataView: { definition: { buckets: bucketsWithAlias(undefined) } },
        });

        renderMenu();

        const input = document.querySelector<HTMLInputElement>(".s-rename-total-label-input input")!;
        expect(input.value).toBe("");
    });

    it("does not push a properties change when Reset to default is clicked on an already-default total (no-op)", () => {
        render(menuTree());

        fireEvent.click(screen.getByRole("button", { name: "Grand total" }));
        fireEvent.click(screen.getByText("Reset to default"));

        expect(pushDataMock).not.toHaveBeenCalled();
    });

    it("does not push a properties change when re-saving the exact same label (no-op)", () => {
        usePivotTablePropsMock.mockReturnValue({
            config: { menu: { totalLabelsEditable: true } },
            execution: { definition: { buckets: bucketsWithAlias("Grand Total") } },
            pushData: pushDataMock,
        } as unknown as ICorePivotTableNextProps);
        useCurrentDataViewMock.mockReturnValue({
            currentDataView: { definition: { buckets: bucketsWithAlias("Grand Total") } },
        });

        renderMenu();

        fireEvent.click(document.querySelector(".s-rename-total-save")!);

        expect(pushDataMock).not.toHaveBeenCalled();
    });

    it("closes the popover and does not push a rename when totalLabelsEditable turns off while it's open", () => {
        const { rerender } = renderMenu();

        // The host (e.g. a dashboard leaving edit mode) disables renaming while the popover is
        // still open - it must not stay visible or let its already-entered value be saved.
        usePivotTablePropsMock.mockReturnValue({
            config: { menu: { totalLabelsEditable: false } },
            execution: { definition: { buckets: bucketsWithAlias(undefined) } },
            pushData: pushDataMock,
        } as unknown as ICorePivotTableNextProps);
        rerender(menuTree());

        expect(document.querySelector(".s-rename-total-label-input")).not.toBeInTheDocument();
        expect(pushDataMock).not.toHaveBeenCalled();
    });
});
