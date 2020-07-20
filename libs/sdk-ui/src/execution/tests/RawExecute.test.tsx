// (C) 2019 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { dummyBackend, dummyBackendEmptyData } from "@gooddata/sdk-backend-mockingbird";
import { IRawExecuteProps, RawExecute } from "../RawExecute";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "../../base/results/facade";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

const DummyBackendEmptyData = dummyBackendEmptyData();
const makeChild = () => jest.fn((_) => <div />);
const renderDummyExecutor = (
    child: jest.Mock<JSX.Element>,
    props: Omit<IRawExecuteProps, "execution" | "children"> = {},
    backend: IAnalyticalBackend = DummyBackendEmptyData,
) => {
    return mount(
        <RawExecute execution={backend.workspace("dummy").execution().forItems([])} {...props}>
            {child}
        </RawExecute>,
    );
};

describe("RawExecute", () => {
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
        const child = jest.fn(({ reload }) => <button onClick={reload} />);
        const wrapper = renderDummyExecutor(child, { loadOnMount: false });
        wrapper.find("button").simulate("click");

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

    it("should invoke onError when execution fails", async () => {
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
            dummyBackend(),
        );

        await createDummyPromise({ delay: 100 });

        expect(onError).toBeCalledTimes(1);
        expect(onLoadingStart).toBeCalledTimes(1);
        expect(onLoadingChanged).toBeCalledTimes(2);
        expect(onLoadingFinish).toBeCalledTimes(0);
    });
});
