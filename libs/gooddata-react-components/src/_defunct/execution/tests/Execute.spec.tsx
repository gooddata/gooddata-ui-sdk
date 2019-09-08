// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";
import { DataLayer, factory } from "@gooddata/gooddata-js";
import { AFM } from "@gooddata/typings";
import { testUtils } from "@gooddata/js-utils";
import { Execute, IExecuteProps } from "../Execute";

describe("Execute", () => {
    const data = [1, 2, 3];
    const afm: AFM.IAfm = {
        attributes: [
            {
                localIdentifier: "a1",
                displayForm: {
                    identifier: "slow_execution",
                },
            },
        ],
    };

    function dataTableFactory() {
        return new DataLayer.DataTable(new DataLayer.DummyAdapter(data));
    }

    function createStatelessChild() {
        return jest.fn(props => <span>{JSON.stringify(props.result)}</span>);
    }

    function createComponent(child: jest.Mock<JSX.Element>, props = {}): any {
        const defaultProps: IExecuteProps = {
            afm,
            projectId: "foo",
            dataTableFactory,
            ...props,
        };

        return mount(<Execute {...defaultProps}>{child}</Execute>);
    }

    it("should pass execution result, error and isLoading to its child", () => {
        const child = createStatelessChild();
        createComponent(child);

        return testUtils.delay().then(() => {
            expect(child).toHaveBeenCalledWith({ result: null, error: null, isLoading: true });
            expect(child).toHaveBeenLastCalledWith({ result: data, error: null, isLoading: false });
            expect(child).toHaveBeenCalledTimes(2);
        });
    });

    it("should dispatch onLoadingChanged before and after execution", () => {
        const onLoadingChanged = jest.fn();
        const child = createStatelessChild();
        createComponent(child, {
            onLoadingChanged,
        });

        return testUtils.delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
        });
    });

    it("should dispatch onLoadingFinish after execution", () => {
        const onLoadingFinish = jest.fn();
        const child = createStatelessChild();
        createComponent(child, {
            onLoadingFinish,
        });

        return testUtils.delay().then(() => {
            expect(onLoadingFinish).toHaveBeenCalledTimes(1);
        });
    });

    it("should not run execution for same AFM", () => {
        const child = createStatelessChild();
        const wrapper = createComponent(child);

        wrapper.setProps({
            afm,
        });

        return testUtils.delay().then(() => {
            expect(child).toHaveBeenCalledTimes(2); // first loading, second result
        });
    });

    it("should be able to override telemetryComponentName", () => {
        const child = createStatelessChild();
        const wrapper = createComponent(child, { telemetryComponentName: "componentName" });
        const wrapperInstance = wrapper.instance();
        expect(wrapperInstance.sdk.config.getRequestHeader("X-GDC-JS-SDK-COMP")).toEqual("componentName");
    });

    it("should run execution on props change (sdk,projectId,afm,resultSpec)", () => {
        const child = createStatelessChild();
        const wrapper = createComponent(child);

        return testUtils.delay().then(() => {
            expect(child).toHaveBeenCalledTimes(2); // first loading, second result
            wrapper.setProps({ sdk: factory({ domain: "example.com" }) });
            expect(child).toHaveBeenCalledTimes(3);
            wrapper.setProps({ projectId: "dummy" });
            expect(child).toHaveBeenCalledTimes(4);
            wrapper.setProps({ afm: {} });
            expect(child).toHaveBeenCalledTimes(5);
            wrapper.setProps({ resultSpec: { a: "a" } });
            expect(child).toHaveBeenCalledTimes(6);
        });
    });
});
