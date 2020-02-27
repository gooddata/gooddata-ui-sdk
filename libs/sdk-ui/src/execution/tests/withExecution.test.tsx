// (C) 2019 GoodData Corporation
import { dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { shallow } from "enzyme";
import React from "react";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { WithLoadingResult } from "../../base/react/withLoading";
import { IWithExecution, withExecution } from "../withExecution";

interface IDummyComponentProps {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: IFilter[];
}

const renderEnhancedComponent = <R extends object>(
    hocConfig?: Omit<IWithExecution<IDummyComponentProps, R>, "execution" | "mapResultToProps">,
) => {
    const CoreComponent: React.FC<WithLoadingResult<DataViewFacade> & IDummyComponentProps> = props => {
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

    const Component = withExecution({
        ...hocConfig,
        execution: ({ attributes, measures, filters }) =>
            dummyBackendEmptyData()
                .workspace("dummy")
                .execution()
                .forItems([...attributes, ...measures], filters),
        mapResultToProps: result => result,
    })(CoreComponent);

    return shallow(<Component attributes={[]} measures={[]} filters={[]} />);
};

describe("withExecution", () => {
    it("should start loading immediately and inject isLoading prop", () => {
        const wrapper = renderEnhancedComponent();
        expect(wrapper.prop("isLoading")).toBe(true);
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const wrapper = renderEnhancedComponent({ loadOnMount: false });
        expect(wrapper.prop("isLoading")).toBe(false);
    });

    it("should stop loading when execution is resolved and inject data view facade", async done => {
        const wrapper = renderEnhancedComponent();
        await createDummyPromise({ delay: 100 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("result")).toBeInstanceOf(DataViewFacade);
        done();
    });

    // TODO: implement rejection in dummyBackend to test error injecting

    it("should inject fetch handler", () => {
        const wrapper = renderEnhancedComponent();
        expect(wrapper.prop("fetch")).toEqual(expect.any(Function));
    });

    it("should start loading again after invoking injected fetch function", async done => {
        const wrapper = renderEnhancedComponent();
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
        done();
    });

    // TODO: implement rejection in dummyBackend to test onError handler

    it("should inject correct props from mapResultToProps", () => {
        const errorProp = "laError";
        const fetchProp = "laFetch";
        const isLoadingProp = "laLoading";
        const resultProp = "laResult";
        const randomProp = "laRandom";

        const Component = withExecution({
            execution: dummyBackendEmptyData()
                .workspace("dummy")
                .execution()
                .forItems([]),
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
