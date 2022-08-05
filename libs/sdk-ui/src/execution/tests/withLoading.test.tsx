// (C) 2019-2022 GoodData Corporation
import React from "react";
import { withExecutionLoading, IWithExecutionLoading, WithLoadingResult } from "../withExecutionLoading";
import { render } from "@testing-library/react";
import { IDummyPromise, createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base";
import { dummyDataView } from "@gooddata/sdk-backend-mockingbird";
import { emptyDef } from "@gooddata/sdk-model";

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
                <button className="Refetch" onClick={reload} />
                {isLoading && <div>Loading</div>}
                {result && <div>{result}</div>}
                {error && <div>{error.message}</div>}
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
    //    const ERROR = new Error("ERROR");

    it.only("should start loading immediately and inject isLoading prop", () => {
        const { getByText } = renderEnhancedComponent({ result: RESULT, delay: 100 });
        expect(getByText("Loading")).toBeInTheDocument();
    });

    //    it("should not start loading immediately if loadOnMount is set to false", () => {
    //        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 }, { loadOnMount: false });
    //        expect(wrapper.prop("isLoading")).toBe(false);
    //    });
    //
    //    it("should stop loading when promise is resolved and inject result prop", async () => {
    //        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 });
    //        await createDummyPromise({ delay: 150 });
    //        expect(wrapper.prop("isLoading")).toBe(false);
    //        expect(wrapper.prop("result")).toBe(RESULT);
    //    });
    //
    //    it("should stop loading when promise is rejected and inject error prop", async () => {
    //        const wrapper = renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
    //        await createDummyPromise({ delay: 150 });
    //        expect(wrapper.prop("isLoading")).toBe(false);
    //        expect(wrapper.prop("error").cause).toBe(ERROR);
    //    });
    //
    //    it("should inject fetch handler", () => {
    //        const wrapper = renderEnhancedComponent({ delay: 100 });
    //        expect(wrapper.prop("reload")).toEqual(expect.any(Function));
    //    });
    //
    //    it("should start loading again after invoking injected fetch function", async () => {
    //        const wrapper = renderEnhancedComponent({ delay: 100 });
    //        await createDummyPromise({ delay: 150 });
    //        wrapper.dive().find(".Refetch").simulate("click");
    //
    //        expect(wrapper.prop("isLoading")).toBe(true);
    //    });
    //
    //    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async () => {
    //        const onLoadingStart = jest.fn();
    //        const onLoadingChanged = jest.fn();
    //        const onLoadingFinish = jest.fn();
    //
    //        renderEnhancedComponent(
    //            { delay: 100, result: EmptyDataViewFacade },
    //            {
    //                events: {
    //                    onLoadingChanged,
    //                    onLoadingFinish,
    //                    onLoadingStart,
    //                },
    //            },
    //        );
    //
    //        await createDummyPromise({ delay: 150 });
    //
    //        expect(onLoadingStart).toBeCalledTimes(1);
    //        expect(onLoadingChanged).toBeCalledTimes(2);
    //        expect(onLoadingFinish).toBeCalledTimes(1);
    //    });
    //
    //    it("should invoke onLoadingStart, onLoadingChanged and onError events", async () => {
    //        const onLoadingStart = jest.fn();
    //        const onLoadingChanged = jest.fn();
    //        const onError = jest.fn();
    //
    //        renderEnhancedComponent(
    //            { willResolve: false, delay: 100 },
    //            {
    //                events: {
    //                    onError,
    //                    onLoadingChanged,
    //                    onLoadingStart,
    //                },
    //            },
    //        );
    //
    //        await createDummyPromise({ delay: 150 });
    //
    //        expect(onLoadingStart).toBeCalledTimes(1);
    //        expect(onLoadingChanged).toBeCalledTimes(2);
    //        expect(onError).toBeCalledTimes(1);
    //    });
});
