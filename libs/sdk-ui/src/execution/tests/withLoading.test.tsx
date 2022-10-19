// (C) 2019-2022 GoodData Corporation
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { withExecutionLoading, IWithExecutionLoading, WithLoadingResult } from "../withExecutionLoading";

import { IDummyPromise, createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base";

const EmptyDataViewFacade = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));

const renderEnhancedComponent = <T, E>(
    promiseConfig: IDummyPromise<DataViewFacade, E>,
    hocConfig?: Omit<IWithExecutionLoading<T>, "promiseFactory" | "exportTitle">,
) => {
    const promiseFactory = (_props?: T) => createDummyPromise(promiseConfig);

    const CoreComponent: React.FC<WithLoadingResult> = (props) => {
        const { result, error, reload, isLoading } = props;
        return (
            <div>
                <button onClick={reload}>Refetch</button>
                {isLoading ? <div>Loading</div> : null}
                {result ? <div>Result</div> : null}
                {error ? (
                    <div>
                        <span>Error</span>
                        {error?.cause?.message}
                    </div>
                ) : null}
            </div>
        );
    };

    const Component: any = withExecutionLoading({
        ...hocConfig,
        promiseFactory,
        exportTitle: "TestComponent",
    })(CoreComponent as any);

    return render(<Component />);
};

describe("withLoading", () => {
    const RESULT = EmptyDataViewFacade;
    const ERROR = new Error("ERROR_MESSAGE");

    it("should start loading immediately and inject isLoading prop", () => {
        renderEnhancedComponent({ result: RESULT, delay: 100 });
        expect(screen.getByText("Loading")).toBeInTheDocument();
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        renderEnhancedComponent({ result: RESULT, delay: 100 }, { loadOnMount: false });
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();
    });

    it("should stop loading when promise is resolved and inject result prop", async () => {
        renderEnhancedComponent({ result: RESULT, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        expect(screen.queryByText("Result")).toBeInTheDocument();
    });

    it("should stop loading when promise is rejected and inject error prop", async () => {
        renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(screen.queryByText("Loading")).not.toBeInTheDocument();
        expect(screen.queryByText("ERROR_MESSAGE")).toBeInTheDocument();
        expect(screen.queryByText("Error")).toBeInTheDocument();
    });

    it("should start loading again after invoking injected fetch function", async () => {
        renderEnhancedComponent({ delay: 100 });
        await createDummyPromise({ delay: 150 });
        await userEvent.click(screen.getByText("Refetch"));
        await waitFor(() => {
            expect(screen.getByText("Loading")).toBeInTheDocument();
        });
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async () => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();

        renderEnhancedComponent(
            { delay: 100, result: EmptyDataViewFacade },
            {
                events: {
                    onLoadingChanged,
                    onLoadingFinish,
                    onLoadingStart,
                },
            },
        );

        await createDummyPromise({ delay: 150 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(1);
    });

    it("should invoke onLoadingStart, onLoadingChanged and onError events", async () => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onError = jest.fn();

        renderEnhancedComponent(
            { willResolve: false, delay: 100 },
            {
                events: {
                    onError,
                    onLoadingChanged,
                    onLoadingStart,
                },
            },
        );

        await createDummyPromise({ delay: 150 });

        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onError).toBeCalledTimes(1);
    });
});
