// (C) 2019-2022 GoodData Corporation
import React from "react";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";
import { withExecutionLoading, IWithExecutionLoading, WithLoadingResult } from "../withExecutionLoading";

import { IDummyPromise, createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base";
import { setupComponent } from "../../base/tests/testHelper";

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
                {isLoading && <div>Loading</div>}
                {result && <div>Result</div>}
                {error && (
                    <div>
                        <span>Error</span>
                        {error?.cause?.message}
                    </div>
                )}
            </div>
        );
    };

    const Component: any = withExecutionLoading({
        ...hocConfig,
        promiseFactory,
        exportTitle: "TestComponent",
    })(CoreComponent as any);

    return setupComponent(<Component />);
};

describe("withLoading", () => {
    const RESULT = EmptyDataViewFacade;
    const ERROR = new Error("ERROR_MESSAGE");

    it("should start loading immediately and inject isLoading prop", () => {
        const { getByText } = renderEnhancedComponent({ result: RESULT, delay: 100 });
        expect(getByText("Loading")).toBeInTheDocument();
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const { queryByText } = renderEnhancedComponent(
            { result: RESULT, delay: 100 },
            { loadOnMount: false },
        );
        expect(queryByText("Loading")).not.toBeInTheDocument();
    });

    it("should stop loading when promise is resolved and inject result prop", async () => {
        const { queryByText } = renderEnhancedComponent({ result: RESULT, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(queryByText("Loading")).not.toBeInTheDocument();
        expect(queryByText("Result")).toBeInTheDocument();
    });

    it("should stop loading when promise is rejected and inject error prop", async () => {
        const { queryByText } = renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(queryByText("Loading")).not.toBeInTheDocument();
        expect(queryByText("ERROR_MESSAGE")).toBeInTheDocument();
        expect(queryByText("Error")).toBeInTheDocument();
    });

    it("should start loading again after invoking injected fetch function", async () => {
        const { getByText, user } = renderEnhancedComponent({ delay: 100 });
        await createDummyPromise({ delay: 150 });
        await user.click(getByText("Refetch"));
        expect(getByText("Loading")).toBeInTheDocument();
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
