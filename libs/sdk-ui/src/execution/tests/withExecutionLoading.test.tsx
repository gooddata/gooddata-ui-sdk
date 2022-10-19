// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withEventing } from "@gooddata/sdk-backend-base";

import { DataViewWindow, WithLoadingResult } from "../withExecutionLoading";
import { IWithExecution, withExecution } from "../withExecution";

import { createDummyPromise } from "../../base/react/tests/toolkit";
interface IDummyComponentProps {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: IFilter[];
    window?: DataViewWindow;
}

const DummyBackendEmptyData = dummyBackendEmptyData();

const renderEnhancedComponent = (
    hocConfig?: Omit<IWithExecution<IDummyComponentProps>, "execution" | "exportTitle">,
    backend: IAnalyticalBackend = DummyBackendEmptyData,
) => {
    const CoreComponent: React.FC<IDummyComponentProps & WithLoadingResult> = (props) => {
        const { result, error, reload, isLoading } = props;
        return (
            <div>
                <button className="Refetch" onClick={reload}>
                    Refetch
                </button>
                {isLoading ? <div className="Loading"> Loading </div> : null}
                {result ? <div className="Result"> Result </div> : null}
                {error ? <div className="Error"> {error.message} </div> : null}
            </div>
        );
    };

    const Component = withExecution({
        ...hocConfig,
        execution: (props?: IDummyComponentProps) => {
            const { attributes, measures, filters } = props ?? {};

            return backend
                .workspace("dummy")
                .execution()
                .forItems([...attributes, ...measures], filters);
        },
        exportTitle: "TestComponent",
    })(CoreComponent);

    return render(<Component attributes={[]} measures={[]} filters={[]} />);
};

describe("withExecution", () => {
    it("should start loading immediately and inject isLoading prop", () => {
        renderEnhancedComponent();
        expect(screen.queryByText("Loading")).toBeInTheDocument();
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        renderEnhancedComponent({ loadOnMount: false });
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    });

    it("should stop loading when execution is resolved and inject data view facade", async () => {
        renderEnhancedComponent();
        await createDummyPromise({ delay: 100 });
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        expect(screen.queryByText("Result")).toBeInTheDocument();
    });

    it("should start loading again after invoking injected fetch function", async () => {
        renderEnhancedComponent();

        userEvent.click(screen.getByText("Refetch"));
        expect(screen.queryByText("Loading")).toBeInTheDocument();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async () => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();

        renderEnhancedComponent({
            events: {
                onLoadingChanged,
                onLoadingFinish,
                onLoadingStart,
            },
        });

        await createDummyPromise({ delay: 150 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(1);
    });

    it("should invoke onError for NoDataErrors without a DataView", async () => {
        const onError = jest.fn();

        renderEnhancedComponent(
            {
                events: {
                    onError,
                },
            },
            dummyBackend({ raiseNoDataExceptions: "without-data-view" }),
        );

        await createDummyPromise({ delay: 150 });

        expect(onError).toBeCalledTimes(1);
    });

    it("should NOT invoke onError for NoDataErrors with a DataView", async () => {
        const onError = jest.fn();

        renderEnhancedComponent(
            {
                events: {
                    onError,
                },
            },
            dummyBackend({ raiseNoDataExceptions: "with-data-view" }),
        );

        await createDummyPromise({ delay: 150 });

        expect(onError).not.toBeCalled();
    });

    it("should do readAll when no window specified", async () => {
        const readAllCallback = jest.fn();
        const readWindowCallback = jest.fn();
        const backend = withEventing(DummyBackendEmptyData, {
            successfulResultReadAll: readAllCallback,
            successfulResultReadWindow: readWindowCallback,
        });

        renderEnhancedComponent({}, backend);
        await createDummyPromise({ delay: 100 });

        expect(readAllCallback).toBeCalled();
        expect(readWindowCallback).not.toBeCalled();
    });

    it("should do readWindow when window specified", async () => {
        const readAllCallback = jest.fn();
        const readWindowCallback = jest.fn();
        const backend = withEventing(DummyBackendEmptyData, {
            successfulResultReadAll: readAllCallback,
            successfulResultReadWindow: readWindowCallback,
        });
        const window = { offset: [1, 1], size: [10, 10] };

        renderEnhancedComponent({ window }, backend);
        await createDummyPromise({ delay: 100 });

        expect(readAllCallback).not.toBeCalled();
        expect(readWindowCallback).toBeCalledWith(
            window.offset,
            window.size,
            expect.any(Object),
            expect.any(String),
        );
    });
});
