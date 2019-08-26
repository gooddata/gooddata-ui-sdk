// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { mount } from "enzyme";

import { BaseVisualization } from "../BaseVisualization";
import { testUtils } from "@gooddata/js-utils";
import {
    ICommonVisualizationProps,
    ILoadingInjectedProps,
    commonDefaultProps,
} from "../VisualizationLoadingHOC";
import { LoadingComponent, ErrorComponent, DummyComponent } from "../../../tests/mocks";
import { ErrorStates } from "../../../../constants/errorStates";
import { oneMeasureResponse } from "../../../../execution/fixtures/ExecuteAfm.fixtures";

const intlMock = {
    formatMessage: ({ id }: { id: string }) => id,
};

describe("Base visualization child", () => {
    const TestVizInnerComponent = DummyComponent;

    class BaseVisualizationChild extends BaseVisualization<
        ICommonVisualizationProps & ILoadingInjectedProps,
        {}
    > {
        public static defaultProps: Partial<ICommonVisualizationProps & ILoadingInjectedProps> = {
            ...commonDefaultProps,
        };

        protected renderVisualization() {
            return <TestVizInnerComponent />;
        }
    }

    const createComponent = (customProps: Partial<ICommonVisualizationProps & ILoadingInjectedProps>) => {
        return mount<Partial<ICommonVisualizationProps>>(
            <BaseVisualizationChild
                execution={null}
                isLoading={false}
                onDataTooLarge={jest.fn()}
                onNegativeValues={jest.fn()}
                intl={intlMock as any}
                {...customProps}
            />,
        );
    };

    it('should render result of "renderVisualization" when correct execution provided', () => {
        const wrapper = createComponent({
            isLoading: false,
            execution: oneMeasureResponse,
        });

        return testUtils.delay().then(() => {
            const visInnerComponent = wrapper.find(TestVizInnerComponent);
            expect(visInnerComponent.length).toBe(1);
        });
    });

    it("should render default LoadingComponent when loading if the loading component has not been specified", () => {
        const wrapper = createComponent({
            isLoading: true,
        });

        return testUtils.delay().then(() => {
            const loadingComponent = wrapper.find("LoadingComponent");
            expect(loadingComponent.length).toBe(1);
        });
    });

    it("should render LoadingComponent when loading if the loading component has been specified", () => {
        const wrapper = createComponent({
            isLoading: true,
            LoadingComponent,
        });

        return testUtils.delay().then(() => {
            const loadingComponent = wrapper.find("LoadingComponent");
            expect(loadingComponent.length).toBe(1);
        });
    });

    it("should render default ErrorComponent on error when ErrorComponent has not been specified", () => {
        const wrapper = createComponent({
            error: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
        });

        return testUtils.delay().then(() => {
            const errorComponent = wrapper.find("ErrorComponent");
            expect(errorComponent.length).toBe(1);
        });
    });

    it("should render ErrorComponent on error passing down props and error status", () => {
        const wrapper = createComponent({
            error: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
            ErrorComponent,
        });

        return testUtils.delay().then(() => {
            const innerWrapped = wrapper.find(TestVizInnerComponent);
            expect(innerWrapped.length).toBe(0);

            const errorComponent = wrapper.find(ErrorComponent);
            expect(errorComponent.length).toBe(1);
            expect(errorComponent.props().code).toEqual(ErrorStates.DATA_TOO_LARGE_TO_COMPUTE);
        });
    });

    it("should render LoadingComponent when execution is null", () => {
        const wrapper = createComponent({
            execution: null,
            LoadingComponent,
            isLoading: true,
        });

        return testUtils.delay().then(() => {
            const loadingComponent = wrapper.find(LoadingComponent);
            expect(loadingComponent.length).toBe(1);
        });
    });
});
