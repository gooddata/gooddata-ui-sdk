// (C) 2019 GoodData Corporation
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "../../base/results/facade";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { shallow } from "enzyme";
import * as React from "react";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { WithLoadingResult } from "../withLoading";
import { IWithExecution, withExecution } from "../withExecution";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

interface IDummyComponentProps {
    attributes?: IAttribute[];
    measures?: IMeasure[];
    filters?: IFilter[];
}

const DummyBackendEmptyData = dummyBackendEmptyData();

const renderEnhancedComponent = (
    hocConfig?: Omit<IWithExecution<IDummyComponentProps>, "execution" | "mapResultToProps">,
    backend: IAnalyticalBackend = DummyBackendEmptyData,
) => {
    const CoreComponent: React.FC<WithLoadingResult & IDummyComponentProps> = props => {
        const { result, error, reload, isLoading } = props;
        return (
            <div>
                <button className="Refetch" onClick={reload} />
                {isLoading && <div className="Loading" />}
                {result && <div className="Result">{result}</div>}
                {error && <div className="Error">{error.message}</div>}
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
        expect(wrapper.prop("reload")).toEqual(expect.any(Function));
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

    it("should invoke onError", async done => {
        const onError = jest.fn();

        /*
         * this test uses dummy backend in the default config which raises NO_DATA errors.
         */
        renderEnhancedComponent(
            {
                events: {
                    onError,
                },
            },
            dummyBackend(),
        );

        await createDummyPromise({ delay: 150 });

        expect(onError).toBeCalledTimes(1);
        done();
    });
});
