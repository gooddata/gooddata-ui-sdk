// (C) 2019-2025 GoodData Corporation

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { type Mock, describe, expect, it, vi } from "vitest";

import { ReferenceMd } from "@gooddata/reference-workspace";
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { type IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { newAttributeSort, newPositiveAttributeFilter, newTotal } from "@gooddata/sdk-model";

import { type AttributeMeasureOrPlaceholder, DataViewFacade, LoadingComponent } from "../../base/index.js";
import { type CreateExecutionOptions, createExecution } from "../createExecution.js";
import { Execute, type IExecuteProps } from "../Execute.js";
import { type IExecuteErrorComponentProps } from "../interfaces.js";

const DummyBackendEmptyData = dummyBackendEmptyData();
const makeChild = () => vi.fn((_) => <div />);
const renderDummyExecutor = (
    child: Mock,
    props: Omit<IExecuteProps, "backend" | "workspace" | "children" | "seriesBy"> = {},
    backend: IAnalyticalBackend = DummyBackendEmptyData,
) => {
    return render(
        <Execute backend={backend} workspace={"testWorkspace"} seriesBy={[ReferenceMd.Amount]} {...props}>
            {child}
        </Execute>,
    );
};

describe("Execute", () => {
    it("should start loading immediately and inject isLoading prop", () => {
        const child = makeChild();
        renderDummyExecutor(child);

        expect(child).toHaveBeenCalledWith({
            isLoading: true,
            error: undefined,
            result: undefined,
            reload: expect.any(Function),
        });
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const child = makeChild();
        renderDummyExecutor(child, { loadOnMount: false });

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: undefined,
            reload: expect.any(Function),
        });
    });

    it("should stop loading when execution is resolved and inject data view facade", async () => {
        const child = makeChild();
        renderDummyExecutor(child);

        await waitFor(() => {
            expect(child).toHaveBeenCalledWith({
                isLoading: false,
                error: undefined,
                result: expect.any(DataViewFacade),
                reload: expect.any(Function),
            });
        });
    });

    it("should stop loading when execution fails", async () => {
        const child = makeChild();
        renderDummyExecutor(child, {}, dummyBackend());

        await waitFor(() => {
            expect(child).toHaveBeenCalledWith({
                isLoading: false,
                error: expect.any(Error),
                result: undefined,
                reload: expect.any(Function),
            });
        });
    });

    it("should start loading after invoking injected reload function", () => {
        const child = vi.fn(({ reload }) => <button onClick={reload}>Reload</button>);
        renderDummyExecutor(child, { loadOnMount: false });
        fireEvent.click(screen.getByText("Reload"));

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: undefined,
            reload: expect.any(Function),
        });
        expect(child).toHaveBeenCalledWith({
            isLoading: true,
            error: undefined,
            result: undefined,
            reload: expect.any(Function),
        });
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async () => {
        const child = makeChild();
        const onLoadingStart = vi.fn();
        const onLoadingChanged = vi.fn();
        const onLoadingFinish = vi.fn();

        renderDummyExecutor(child, {
            onLoadingChanged,
            onLoadingFinish,
            onLoadingStart,
        });

        await waitFor(() => {
            expect(onLoadingStart).toBeCalledTimes(1);
            expect(onLoadingChanged).toBeCalledTimes(2);
            expect(onLoadingFinish).toBeCalledTimes(1);
        });
    });

    it("should invoke onError when execution fails with a NoDataError without a DataView", async () => {
        const child = makeChild();
        const onLoadingStart = vi.fn();
        const onLoadingChanged = vi.fn();
        const onLoadingFinish = vi.fn();
        const onError = vi.fn();

        renderDummyExecutor(
            child,
            {
                onError,
                onLoadingChanged,
                onLoadingFinish,
                onLoadingStart,
            },
            dummyBackend({ raiseNoDataExceptions: "without-data-view" }),
        );

        await waitFor(() => {
            expect(onError).toBeCalledTimes(1);
            expect(onLoadingStart).toBeCalledTimes(1);
            expect(onLoadingChanged).toBeCalledTimes(2);
            expect(onLoadingFinish).not.toBeCalled();
        });
    });

    it("should NOT invoke onError when execution fails with a NoDataError with a DataView", async () => {
        const child = makeChild();
        const onLoadingStart = vi.fn();
        const onLoadingChanged = vi.fn();
        const onLoadingFinish = vi.fn();
        const onError = vi.fn();

        renderDummyExecutor(
            child,
            {
                onError,
                onLoadingChanged,
                onLoadingFinish,
                onLoadingStart,
            },
            dummyBackend({ raiseNoDataExceptions: "with-data-view" }),
        );

        await waitFor(() => {
            expect(onError).not.toBeCalled();
            expect(onLoadingStart).toBeCalledTimes(1);
            expect(onLoadingChanged).toBeCalledTimes(2);
            expect(onLoadingFinish).toBeCalledTimes(1);
        });
    });

    it("should render LoadingComponent", async () => {
        const child = makeChild();
        renderDummyExecutor(child, {
            LoadingComponent: () => <div>MOCKED LOADING</div>,
        });

        expect(screen.queryByText("MOCKED LOADING")).toBeInTheDocument();
    });

    it("should render ErrorComponent, when execution fails", async () => {
        function ErrorComponent(_props: IExecuteErrorComponentProps) {
            return <div>MOCKED ERROR</div>;
        }
        const child = makeChild();
        renderDummyExecutor(
            child,
            {
                ErrorComponent,
            },
            dummyBackend(),
        );

        await waitFor(() => {
            expect(screen.queryByText("MOCKED ERROR")).toBeInTheDocument();
        });
    });

    it("should not call children function without result, when both Loading & ErrorComponent are provided", async () => {
        function ErrorComponent(_props: IExecuteErrorComponentProps) {
            return <div />;
        }
        const child = makeChild();
        renderDummyExecutor(child, {
            LoadingComponent,
            ErrorComponent,
        });

        expect(child).not.toHaveBeenCalledWith(
            expect.objectContaining({
                result: undefined,
            }),
        );

        await waitFor(() => {
            expect(child).toHaveBeenCalledWith(
                expect.objectContaining({
                    result: expect.any(DataViewFacade),
                }),
            );
        });
    });

    it("should throw if neither seriesBy not slicesBy have any elements", async () => {
        render(
            <Execute backend={DummyBackendEmptyData} workspace={"testWorkspace"}>
                {({ error }) => {
                    if (error) {
                        return <div className="my-error">ERROR</div>;
                    }
                    return null;
                }}
            </Execute>,
        );

        await waitFor(() => {
            expect(screen.queryByText("ERROR")).toBeInTheDocument();
        });
    });
});

describe("createExecution", () => {
    const Scenarios: Array<[string, Partial<IExecuteProps>]> = [
        ["unscoped series only", { seriesBy: [ReferenceMd.Amount] }],
        [
            "scoped series only",
            {
                seriesBy: [
                    ReferenceMd.Amount,
                    ReferenceMd.Region as unknown as AttributeMeasureOrPlaceholder,
                ],
            },
        ],
        [
            "unscoped series with slicing",
            { seriesBy: [ReferenceMd.Amount], slicesBy: [ReferenceMd.Product.Name] },
        ],
        [
            "scoped series with slicing",
            {
                seriesBy: [
                    ReferenceMd.Amount,
                    ReferenceMd.Region as unknown as AttributeMeasureOrPlaceholder,
                ],
                slicesBy: [ReferenceMd.Product.Name],
            },
        ],
        [
            "scoped series with slicing and filter",
            {
                seriesBy: [
                    ReferenceMd.Amount,
                    ReferenceMd.Region as unknown as AttributeMeasureOrPlaceholder,
                ],
                slicesBy: [ReferenceMd.Product.Name],
                filters: [newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])],
            },
        ],
        [
            "scoped series with slicing and sortBy",
            {
                seriesBy: [
                    ReferenceMd.Amount,
                    ReferenceMd.Region as unknown as AttributeMeasureOrPlaceholder,
                ],
                slicesBy: [ReferenceMd.Product.Name],
                sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
            },
        ],
        [
            "scoped series with slicing and totals",
            {
                seriesBy: [
                    ReferenceMd.Amount,
                    ReferenceMd.Region as unknown as AttributeMeasureOrPlaceholder,
                ],
                slicesBy: [ReferenceMd.Product.Name],
                totals: [newTotal("sum", ReferenceMd.Amount, ReferenceMd.Product.Name)],
            },
        ],
        ["unscoped series only with only attributes (RAIL-4265)", { seriesBy: [ReferenceMd.Product.Name] }],
    ];

    it.each(Scenarios)("should create correct definition for %s", (_desc, props) => {
        const input: IExecuteProps = {
            backend: DummyBackendEmptyData,
            workspace: "testWorkspace",
            seriesBy: props.seriesBy!,
            children: makeChild(),
            ...props,
        };

        const execution = createExecution(input as CreateExecutionOptions);

        expect(execution.definition).toMatchSnapshot();
    });
});
