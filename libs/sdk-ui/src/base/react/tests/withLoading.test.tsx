// (C) 2019 GoodData Corporation
import React from "react";
import { withLoading, IWithLoading, WithLoadingResult } from "../withLoading";
import { shallow } from "enzyme";
import { IDummyPromise, createDummyPromise } from "./toolkit";

const renderEnhancedComponent = <T, P, E, R extends object>(
    promiseConfig: IDummyPromise<P, E>,
    hocConfig?: Omit<IWithLoading<T, P, R>, "promiseFactory" | "mapResultToProps">,
) => {
    const promiseFactory = ({}) => createDummyPromise(promiseConfig);

    const CoreComponent: React.FC<WithLoadingResult<P>> = props => {
        const { result, error, fetch, isLoading } = props;
        return (
            <div>
                <button className="Refetch" onClick={fetch} />
                {isLoading && <div className="Loading" />}
                {result && <div className="Result">{result}</div>}
                {error && <div className="Error">{error.message}</div>}
            </div>
        );
    };

    const Component = withLoading({
        ...hocConfig,
        promiseFactory,
        mapResultToProps: result => result,
    })(CoreComponent);

    return shallow(<Component />);
};

describe("withLoading", () => {
    const RESULT = "RESULT";
    const ERROR = new Error("ERROR");

    it("should start loading immediately and inject isLoading prop", () => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 });
        expect(wrapper.prop("isLoading")).toBe(true);
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 }, { loadOnMount: false });
        expect(wrapper.prop("isLoading")).toBe(false);
    });

    it("should stop loading when promise is resolved and inject result prop", async done => {
        const wrapper = renderEnhancedComponent({ result: RESULT, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("result")).toBe(RESULT);
        done();
    });

    it("should stop loading when promise is rejected and inject error prop", async done => {
        const wrapper = renderEnhancedComponent({ willResolve: false, error: ERROR, delay: 100 });
        await createDummyPromise({ delay: 150 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("error")).toBe(ERROR);
        done();
    });

    it("should inject fetch handler", () => {
        const wrapper = renderEnhancedComponent({ delay: 100 });
        expect(wrapper.prop("fetch")).toEqual(expect.any(Function));
    });

    it("should start loading again after invoking injected fetch function", async done => {
        const wrapper = renderEnhancedComponent({ delay: 100 });
        await createDummyPromise({ delay: 150 });
        wrapper
            .dive()
            .find(".Refetch")
            .simulate("click");

        expect(wrapper.prop("isLoading")).toBe(true);
        done();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async done => {
        const onLoadingStart = jest.fn();
        const onLoadingChanged = jest.fn();
        const onLoadingFinish = jest.fn();

        renderEnhancedComponent(
            { delay: 100 },
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
        done();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onError events", async done => {
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
        done();
    });

    it("should inject correct props from mapResultToProps", () => {
        const promiseFactory = ({}) => createDummyPromise({ delay: 100 });
        const errorProp = "laError";
        const fetchProp = "laFetch";
        const isLoadingProp = "laLoading";
        const resultProp = "laResult";
        const randomProp = "laRandom";

        const Component = withLoading({
            promiseFactory,
            mapResultToProps: ({ error, fetch, isLoading, result }) => {
                return {
                    [errorProp]: error,
                    [fetchProp]: fetch,
                    [isLoadingProp]: isLoading,
                    [resultProp]: result,
                    [randomProp]: true,
                };
            },
        })(() => <div />);

        const wrapper = shallow(<Component />);
        const props = wrapper.props();
        expect(props).toHaveProperty(errorProp);
        expect(props).toHaveProperty(fetchProp);
        expect(props).toHaveProperty(isLoadingProp);
        expect(props).toHaveProperty(resultProp);
        expect(props).toHaveProperty(randomProp);
    });
});
