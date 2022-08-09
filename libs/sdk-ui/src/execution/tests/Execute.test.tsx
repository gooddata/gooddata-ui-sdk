// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render } from "@testing-library/react";
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base/results/facade";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Execute, IExecuteProps } from "../Execute";
import { ReferenceMd } from "@gooddata/reference-workspace";
import { newAttributeSort, newPositiveAttributeFilter, newTotal } from "@gooddata/sdk-model";
import { createExecution, CreateExecutionOptions } from "../createExecution";
import { LoadingComponent } from "../../base/react/LoadingComponent";
import { IExecuteErrorComponent } from "../interfaces";
import { setupComponent } from "../../base/tests/testHelper";

const DummyBackendEmptyData = dummyBackendEmptyData();
const makeChild = () => jest.fn((_) => <div />);
const renderDummyExecutor = (
    child: jest.Mock<JSX.Element>,
    props: Omit<IExecuteProps, "backend" | "workspace" | "children" | "seriesBy"> = {},
    backend: IAnalyticalBackend = DummyBackendEmptyData,
) => {
    return setupComponent(
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
        await createDummyPromise({ delay: 100 });

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: expect.any(DataViewFacade),
            reload: expect.any(Function),
        });
    });

    it("should stop loading when execution fails", async () => {
        const child = makeChild();
        renderDummyExecutor(child, {}, dummyBackend());
        await createDummyPromise({ delay: 100 });

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: expect.any(Error),
            result: undefined,
            reload: expect.any(Function),
        });
    });

    it("should start loading after invoking injected reload function", async () => {
        const child = jest.fn(({ reload }) => <button onClick={reload}>Reload</button>);
        const { getByText, user } = renderDummyExecutor(child, { loadOnMount: false });
        await user.click(getByText("Reload"));

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
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();

        renderDummyExecutor(child, {
            onLoadingChanged,
            onLoadingFinish,
            onLoadingStart,
        });

        await createDummyPromise({ delay: 100 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(1);
    });

    it("should invoke onError when execution fails with a NoDataError without a DataView", async () => {
        const child = makeChild();
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();
        const onError = jest.fn();

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

        await createDummyPromise({ delay: 100 });

        expect(onError).toBeCalledTimes(1);
        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).not.toBeCalled();
    });

    it("should NOT invoke onError when execution fails with a NoDataError with a DataView", async () => {
        const child = makeChild();
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();
        const onError = jest.fn();

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

        await createDummyPromise({ delay: 100 });

        expect(onError).not.toBeCalled();
        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(1);
    });

    it("should render LoadingComponent", async () => {
        const child = makeChild();
        const { queryByText } = renderDummyExecutor(child, {
            LoadingComponent: () => <div>MOCKED LOADING</div>,
        });

        expect(queryByText("MOCKED LOADING")).toBeInTheDocument();
    });

    it("should render ErrorComponent, when execution fails", async () => {
        const ErrorComponent: IExecuteErrorComponent = () => <div>MOCKED ERROR</div>;
        const child = makeChild();
        const { queryByText } = renderDummyExecutor(
            child,
            {
                ErrorComponent,
            },
            dummyBackend(),
        );

        await createDummyPromise({ delay: 100 });

        expect(queryByText("MOCKED ERROR")).toBeInTheDocument();
    });

    it("should not call children function without result, when both Loading & ErrorComponent are provided", async () => {
        const ErrorComponent: IExecuteErrorComponent = () => <div />;
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

        await createDummyPromise({ delay: 100 });

        expect(child).toHaveBeenCalledWith(
            expect.objectContaining({
                result: expect.any(DataViewFacade),
            }),
        );
    });

    it("should throw if neither seriesBy not slicesBy have any elements", async () => {
        const { queryByText } = render(
            <Execute backend={DummyBackendEmptyData} workspace={"testWorkspace"}>
                {({ error }) => {
                    if (error) {
                        return <div className="my-error">ERROR</div>;
                    }
                    return null;
                }}
            </Execute>,
        );

        await createDummyPromise({ delay: 100 });

        expect(queryByText("ERROR")).toBeInTheDocument();
    });
});

describe("createExecution", () => {
    const Scenarios: Array<[string, Partial<IExecuteProps>]> = [
        ["unscoped series only", { seriesBy: [ReferenceMd.Amount] }],
        ["scoped series only", { seriesBy: [ReferenceMd.Amount, ReferenceMd.Region] }],
        [
            "unscoped series with slicing",
            { seriesBy: [ReferenceMd.Amount], slicesBy: [ReferenceMd.Product.Name] },
        ],
        [
            "scoped series with slicing",
            { seriesBy: [ReferenceMd.Amount, ReferenceMd.Region], slicesBy: [ReferenceMd.Product.Name] },
        ],
        [
            "scoped series with slicing and filter",
            {
                seriesBy: [ReferenceMd.Amount, ReferenceMd.Region],
                slicesBy: [ReferenceMd.Product.Name],
                filters: [newPositiveAttributeFilter(ReferenceMd.Product.Name, ["CompuSci"])],
            },
        ],
        [
            "scoped series with slicing and sortBy",
            {
                seriesBy: [ReferenceMd.Amount, ReferenceMd.Region],
                slicesBy: [ReferenceMd.Product.Name],
                sortBy: [newAttributeSort(ReferenceMd.Product.Name, "desc")],
            },
        ],
        [
            "scoped series with slicing and totals",
            {
                seriesBy: [ReferenceMd.Amount, ReferenceMd.Region],
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
