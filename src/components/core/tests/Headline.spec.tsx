import * as React from 'react';
import { mount } from 'enzyme';

import { delay } from '../../tests/utils';
import {
    oneMeasureDataSource
} from '../../tests/mocks';

import { Headline } from '../Headline';
import { ICommonVisualizationProps } from '../base/VisualizationLoadingHOC';
import { HeadlineTransformation } from '@gooddata/indigo-visualizations';
import { IDataSourceProviderInjectedProps } from '../../afm/DataSourceProvider';

describe('Headline', () => {
    const createComponent = () => {
        return mount<Partial<ICommonVisualizationProps & IDataSourceProviderInjectedProps>>((
            <Headline
                dataSource={oneMeasureDataSource}
                afterRender={jest.fn()}
                drillableItems={[]}
                resultSpec={{}}
            />
        ));
    };

    it('should render HeadlineTransformation and pass down given props and props from execution', () => {
        const wrapper = createComponent();

        return delay().then(() => {
            wrapper.update();
            const renderdHeadlineTrans = wrapper.find(HeadlineTransformation);
            const wrapperProps = wrapper.props();
            expect(renderdHeadlineTrans.props()).toMatchObject({
                executionRequest: {
                    afm: wrapperProps.dataSource.getAfm(),
                    resultSpec: wrapperProps.resultSpec
                },
                executionResponse: expect.any(Object),
                executionResult: expect.any(Object),
                onAfterRender: wrapperProps.afterRender,
                drillableItems: wrapperProps.drillableItems
            });
        });
    });
});
