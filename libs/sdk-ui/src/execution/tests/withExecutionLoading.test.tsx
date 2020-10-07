// (C) 2019 GoodData Corporation
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { DataViewFacade } from "../../base/results/facade";
import { IAttribute, IFilter, IMeasure } from "@gooddata/sdk-model";
import { shallow } from "enzyme";
import React from "react";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewWindow, WithLoadingResult } from "../withExecutionLoading";
import { IWithExecution, withExecution } from "../withExecution";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { withEventing } from "@gooddata/sdk-backend-base";

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
    const CoreComponent: React.FC<WithLoadingResult & IDummyComponentProps> = (props) => {
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
        exportTitle: "TestComponent",
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

    it("should stop loading when execution is resolved and inject data view facade", async () => {
        const wrapper = renderEnhancedComponent();
        await createDummyPromise({ delay: 100 });
        expect(wrapper.prop("isLoading")).toBe(false);
        expect(wrapper.prop("result")).toBeInstanceOf(DataViewFacade);
    });

    it("should inject fetch handler", () => {
        const wrapper = renderEnhancedComponent();
        expect(wrapper.prop("reload")).toEqual(expect.any(Function));
    });

    it("should start loading again after invoking injected fetch function", async () => {
        const wrapper = renderEnhancedComponent();
        await createDummyPromise({ delay: 150 });
        wrapper.dive().find(".Refetch").simulate("click");

        expect(wrapper.prop("isLoading")).toBe(true);
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

    it("should invoke onError", async () => {
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
        expect(readWindowCallback).toBeCalledWith(window.offset, window.size, expect.any(Object));
    });
});
