// (C) 2019-2025 GoodData Corporation
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { dummyDataView } from "@gooddata/sdk-backend-base";
import { emptyDef } from "@gooddata/sdk-model";
import { withExecutionLoading, IWithExecutionLoading, WithLoadingResult } from "../withExecutionLoading.js";

import { IDummyPromise, createDummyPromise } from "../../base/react/tests/toolkit.js";
import { DataViewFacade } from "../../base/index.js";
import { describe, expect, it, vi } from "vitest";

const EmptyDataViewFacade = DataViewFacade.for(dummyDataView(emptyDef("testWorkspace")));

const renderEnhancedComponent = <T, E>(
    promiseConfig: IDummyPromise<DataViewFacade, E>,
    hocConfig?: Omit<IWithExecutionLoading<T>, "promiseFactory" | "exportTitle">,
) => {
    const promiseFactory = (_props?: T) => createDummyPromise(promiseConfig);

    function CoreComponent(props: WithLoadingResult) {
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
    }

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
        await waitFor(() => {
            expect(screen.queryByText("Loading")).not.toBeInTheDocument();
            expect(screen.queryByText("Result")).toBeInTheDocument();
        });
    });

    it("should stop loading when promise is rejected and inject error prop", async () => {
        renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
        await waitFor(() => {
            expect(screen.queryByText("Loading")).not.toBeInTheDocument();
            expect(screen.queryByText("ERROR_MESSAGE")).toBeInTheDocument();
            expect(screen.queryByText("Error")).toBeInTheDocument();
        });
    });

    it("should start loading again after invoking injected fetch function", async () => {
        renderEnhancedComponent({ delay: 100 });
        await createDummyPromise({ delay: 150 });
        fireEvent.click(screen.getByText("Refetch"));
        await waitFor(() => {
            expect(screen.getByText("Loading")).toBeInTheDocument();
        });
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async () => {
        const onLoadingStart = vi.fn();
        const onLoadingChanged = vi.fn();
        const onLoadingFinish = vi.fn();

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
        const onLoadingStart = vi.fn();
        const onLoadingChanged = vi.fn();
        const onError = vi.fn();

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
