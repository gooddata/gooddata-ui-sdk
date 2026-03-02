// (C) 2026 GoodData Corporation

import { type PropsWithChildren } from "react";

import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { PivotTableNextImplementation } from "./PivotTableNext.js";
import { type ICorePivotTableNextProps } from "./types/internal.js";

const { useInitExecutionResultMock } = vi.hoisted(() => ({
    useInitExecutionResultMock: vi.fn(),
}));

// Switch the component between loading/success/failure branches per test.
vi.mock("./hooks/init/useInitExecutionResult.js", () => ({
    useInitExecutionResult: useInitExecutionResultMock,
}));

// Required only for success branch to keep smoke test focused.
vi.mock("ag-grid-react", () => ({
    AgGridReact: () => <div data-testid="ag-grid-react" />,
}));

// Prevent heavy column-def derivation from mocked/empty dataView in this smoke test.
vi.mock("./context/ColumnDefsContext.js", () => ({
    ColumnDefsProvider: ({ children }: PropsWithChildren) => children,
    useColumnDefs: vi.fn(() => ({
        columnDefinitionByColId: {},
        columnDefs: [],
        columnDefsFlat: [],
        isPivoted: false,
    })),
}));

describe("PivotTableNext smoke test", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should render default loading component in loading state", () => {
        useInitExecutionResultMock.mockReturnValue({
            status: "loading",
            result: undefined,
            error: undefined,
        });

        const { container } = render(<PivotTableNextImplementation execution={createExecutionMock()} />);

        expect(container.querySelector(".s-loading")).toBeInTheDocument();
        expect(screen.queryByTestId("ag-grid-react")).not.toBeInTheDocument();
    });

    it("should render table container in success state", () => {
        useInitExecutionResultMock.mockReturnValue({
            status: "success",
            result: {
                initialExecutionResult: {},
                initialDataView: {},
            },
            error: undefined,
        });

        render(<PivotTableNextImplementation execution={createExecutionMock()} />);

        expect(screen.getByTestId("ag-grid-react")).toBeInTheDocument();
    });

    it("should render error component in error state", () => {
        useInitExecutionResultMock.mockReturnValue({
            status: "error",
            result: undefined,
            error: new Error("test error"),
        });

        const { container } = render(<PivotTableNextImplementation execution={createExecutionMock()} />);

        expect(container.querySelector(".s-error")).toBeInTheDocument();
        expect(screen.queryByTestId("ag-grid-react")).not.toBeInTheDocument();
    });
});

function createExecutionMock(): ICorePivotTableNextProps["execution"] {
    return {
        fingerprint: () => "test-execution-fingerprint",
    } as ICorePivotTableNextProps["execution"];
}
