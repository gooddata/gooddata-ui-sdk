import * as React from 'react';
import { mount } from 'enzyme';

import { BaseVisualization } from '../BaseVisualization';
import { delay } from '../../../tests/utils';
import {
    ICommonVisualizationProps,
    ILoadingInjectedProps
} from '../VisualizationLoadingHOC';
import {
    LoadingComponent,
    ErrorComponent,
    DummyComponent
} from '../../../tests/mocks';
import { ErrorStates } from '../../../../constants/errorStates';
import { oneMeasureResponse } from '../../../../execution/fixtures/ExecuteAfm.fixtures';

describe('Base visualization child', () => {
    const TestVizInnerComponent = DummyComponent;

    class BaseVisualizationChild extends BaseVisualization<ICommonVisualizationProps & ILoadingInjectedProps, {}> {
        protected renderVisualization() {
            return <TestVizInnerComponent />;
        }
    }

    const createComponent = (customProps: Partial<ICommonVisualizationProps & ILoadingInjectedProps>) => {
        return mount<Partial<ICommonVisualizationProps>>((
            <BaseVisualizationChild
                dataSource={null}
                error={ErrorStates.OK}
                execution={null}
                isLoading={false}
                onDataTooLarge={jest.fn()}
                onNegativeValues={jest.fn()}
                {...customProps}
            />
        ));
    };

    it('should render result of "renderVisualization" when correct execution provided', () => {
        const wrapper = createComponent({
            isLoading: false,
            error: ErrorStates.OK,
            execution: oneMeasureResponse
        });

        return delay().then(() => {
            const visInnerComponent = wrapper.find(TestVizInnerComponent);
            expect(visInnerComponent.length).toBe(1);
        });
    });

    it('should render null when loading if the loading component has not been specified', () => {
        const wrapper = createComponent({
            isLoading: true,
            error: ErrorStates.OK
        });

        return delay().then(() => {
            expect(wrapper.html()).toBe(null);
        });
    });

    it('should render LoadingComponent when loading if the loading component has been specified', () => {
        const wrapper = createComponent({
            isLoading: true,
            LoadingComponent,
            error: ErrorStates.OK
        });

        return delay().then(() => {
            const loadingComponent = wrapper.find(LoadingComponent);
            expect(loadingComponent.length).toBe(1);
        });
    });

    it('should render null on error when ErrorComponent has not been specified', () => {
        const wrapper = createComponent({
            error: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE
        });

        return delay().then(() => {
            expect(wrapper.html()).toBe(null);
        });
    });

    it('should render ErrorComponent on error passing down props and error status', () => {
        const wrapper = createComponent({
            error: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE,
            ErrorComponent
        });

        return delay().then(() => {
            const innerWrapped = wrapper.find(TestVizInnerComponent);
            expect(innerWrapped.length).toBe(0);

            const errorComponent = wrapper.find(ErrorComponent);
            expect(errorComponent.length).toBe(1);
            expect(errorComponent.props().props).toBe(wrapper.props());
            expect(errorComponent.props().error).toEqual({ status: ErrorStates.DATA_TOO_LARGE_TO_COMPUTE });
        });
    });

    it('should render LoadingComponent when execution is null', () => {
        const wrapper = createComponent({
            execution: null,
            LoadingComponent
        });

        return delay().then(() => {
            const errorComponent = wrapper.find(LoadingComponent);
            expect(errorComponent.length).toBe(1);
            expect(errorComponent.props().props).toBe(wrapper.props());
        });
    });
});
