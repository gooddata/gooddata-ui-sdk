// (C) 2026 GoodData Corporation

/**
 * Shared stand-in for `ag-grid-react`.
 *
 * The test suite runs without isolation, so the module graph is shared between test files. Every file
 * that needs `ag-grid-react` replaced must therefore mock it with this very module - the mock of the file
 * that happens to load `PivotTableNext` first is the one baked into the shared graph, so all of them have
 * to be interchangeable:
 *
 * ```ts
 * vi.mock("ag-grid-react", () => import("../../testUtils/agGridReactMock.js"));
 * ```
 */

/**
 * Test id of the element rendered instead of the real grid.
 */
export const AG_GRID_MOCK_TEST_ID = "ag-grid-react";

/**
 * The subset of the grid props the tests assert on; the rest is captured as-is.
 */
export interface IAgGridReactMockProps {
    serverSideDatasource?: unknown;
    [prop: string]: unknown;
}

/**
 * Props of every render of the mocked grid, in render order. Reset it in `beforeEach`, module state
 * outlives a single test file in a non-isolated run.
 */
export const capturedAgGridProps: IAgGridReactMockProps[] = [];

/**
 * Drop-in replacement for the real `AgGridReact` component.
 */
export function AgGridReact(props: IAgGridReactMockProps) {
    capturedAgGridProps.push(props);

    return <div data-testid={AG_GRID_MOCK_TEST_ID} />;
}

/**
 * Forgets all props captured so far.
 */
export function resetCapturedAgGridProps() {
    capturedAgGridProps.length = 0;
}
