// (C) 2019 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { dummyBackend } from "@gooddata/sdk-backend-mockingbird";
import { Executor, IExecutorProps } from "../Executor";
import { createDummyPromise } from "../../base/react/tests/toolkit";
import { DataViewFacade } from "@gooddata/sdk-backend-spi";

const makeChild = () => jest.fn(_ => <div />);
const renderDummyExecutor = (
    child: jest.Mock<JSX.Element>,
    props: Omit<IExecutorProps, "execution" | "children"> = {},
) => {
    return mount(
        <Executor
            execution={dummyBackend()
                .workspace("dummy")
                .execution()
                .forItems([])}
            {...props}
        >
            {child}
        </Executor>,
    );
};

describe("Executor", () => {
    it("should start loading immediately and inject isLoading prop", () => {
        const child = makeChild();
        renderDummyExecutor(child);

        expect(child).toHaveBeenCalledWith({
            isLoading: true,
            error: undefined,
            result: undefined,
            fetch: expect.any(Function),
        });
    });

    it("should not start loading immediately if loadOnMount is set to false", () => {
        const child = makeChild();
        renderDummyExecutor(child, { loadOnMount: false });

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: undefined,
            fetch: expect.any(Function),
        });
    });

    it("should stop loading when execution is resolved and inject data view facade", async done => {
        const child = makeChild();
        renderDummyExecutor(child);
        await createDummyPromise({ delay: 100 });

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: expect.any(DataViewFacade),
            fetch: expect.any(Function),
        });
        done();
    });

    // TODO: implement rejection in dummyBackend to test error injecting

    it("should start loading after invoking injected fetch function", async done => {
        const child = jest.fn(({ fetch }) => <button onClick={fetch} />);
        const wrapper = renderDummyExecutor(child, { loadOnMount: false });
        wrapper.find("button").simulate("click");

        expect(child).toHaveBeenCalledWith({
            isLoading: false,
            error: undefined,
            result: undefined,
            fetch: expect.any(Function),
        });
        expect(child).toHaveBeenCalledWith({
            isLoading: true,
            error: undefined,
            result: undefined,
            fetch: expect.any(Function),
        });
        done();
    });

    it("should invoke onLoadingStart, onLoadingChanged and onLoadingFinish events", async done => {
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
        done();
    });

    // TODO: implement rejection in dummyBackend to test onError handler
});
