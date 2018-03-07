import * as React from 'react';
import { mount } from 'enzyme';
import { delay } from '../../tests/utils';
import { AFM } from '@gooddata/typings';
import {
    TableTransformation,
    ResponsiveTable,
    oneMeasureDataSource,
    executionObjectWithTotalsDataSource,
    IndigoTable
} from '../../tests/mocks';

// Replace this with optional prop
jest.mock('@gooddata/indigo-visualizations', () => ({
    TableTransformation,
    ResponsiveTable,
    Table: IndigoTable
}));

import { PureTable, ITableProps, ITableState } from '../PureTable';
import { executionObjectWithTotals } from '../../../execution/fixtures/ExecuteAfm.fixtures';

function getFakeSortItem(): AFM.SortItem {
    return {
        measureSortItem: {
            direction: 'asc',
            locators: [{
                measureLocatorItem: {
                    measureIdentifier: 'id'
                }
            }]
        }
    };
}

describe('PureTable', () => {
    const createComponent = (props: ITableProps) => {
        return mount<ITableProps, ITableState>(<PureTable {...props} />);
    };

    const createProps = (customProps = {}): ITableProps => {
        return {
            dataSource: oneMeasureDataSource,
            resultSpec: {},
            locale: 'en-US',
            drillableItems: [],
            afterRender: jest.fn(),
            pushData: jest.fn(),
            visualizationProperties: {},
            height: 200,
            maxHeight: 400,
            environment: 'none',
            stickyHeaderOffset: 20,
            totals: [],
            totalsEditAllowed: true,
            onTotalsEdit: jest.fn(),
            onFiredDrillEvent: jest.fn(),
            ...customProps
        };
    };

    it('should render TableTransformation and pass down given props and props from execution', () => {
        const props = createProps({
            environment: 'dashboards'
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.props()).toMatchObject({
                executionRequest: {
                    afm: props.dataSource.getAfm(),
                    resultSpec: props.resultSpec
                },
                executionResponse: expect.any(Object),
                executionResult: expect.any(Object),
                afterRender: props.afterRender,
                drillableItems: props.drillableItems,
                config: { stickyHeaderOffset: props.stickyHeaderOffset },
                height: props.height,
                maxHeight: props.maxHeight,
                onFiredDrillEvent: props.onFiredDrillEvent,
                totals: props.totals,
                totalsEditAllowed: props.totalsEditAllowed,
                lastAddedTotalType: ''
            });
        });
    });

    it('should render TableTransformation with renderer ResponsiveTable for environment "dashboards"', () => {
        const props = createProps({
            environment: 'dashboards'
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.length).toBe(1);
            expect(renderedTableTransformation.props().tableRenderer().type).toBe(ResponsiveTable);
            const tableRendererProps = renderedTableTransformation.props().tableRenderer().props;
            expect(tableRendererProps).toMatchObject({
                page: 1,
                rowsPerPage: 9,
                totals: wrapper.props().totals
            });
        });
    });

    it('should render TableTransformation with renderer Table for default environment', () => {
        const props = createProps();
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            expect(renderedTableTransformation.length).toBe(1);
            expect(renderedTableTransformation.props().tableRenderer().type).toBe(IndigoTable);
            const tableRendererProps = renderedTableTransformation.props().tableRenderer().props;
            expect(tableRendererProps).toMatchObject({
                containerMaxHeight: wrapper.props().maxHeight
            });
        });
    });

    it('should call on error when TableTransformation fired onDataTooLarge', () => {
        const onError = jest.fn();
        const props = createProps({
            onError,
            environment: 'dashboards'
        });

        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            onError.mockReset();

            renderedTableTransformation.props().onDataTooLarge();

            expect(onError).toHaveBeenCalledWith({
                options: {
                    dateOptionsDisabled: false
                },
                status: 'DATA_TOO_LARGE_TO_DISPLAY'
            });
        });
    });

    it('should call pushData when ResponsiveTable renderer fired onSortChange', () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            environment: 'dashboards',
            pushData: pushDataSpy
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            const fakeSortItem: AFM.SortItem = getFakeSortItem();
            renderedTableTransformation.props().tableRenderer().props.onSortChange(fakeSortItem);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    sortItems: [fakeSortItem]
                }
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it('should call pushData when Indigo Table renderer fired onSortChange', () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            pushData: pushDataSpy
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            const fakeSortItem: AFM.SortItem = getFakeSortItem();
            renderedTableTransformation.props().tableRenderer().props.onSortChange(fakeSortItem);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    sortItems: [fakeSortItem]
                }
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it('should call pushData with converted totals when TableTransformation fired onTotalsEdit', () => {
        const pushDataSpy = jest.fn();
        const props = createProps({
            pushData: pushDataSpy,
            dataSource: executionObjectWithTotalsDataSource
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderedTableTransformation = wrapper.find(TableTransformation);
            pushDataSpy.mockReset();

            renderedTableTransformation.props().onTotalsEdit([{
                alias: 'aaa',
                type: 'sum',
                outputMeasureIndexes: [0]
            }]);

            expect(pushDataSpy).toHaveBeenCalledWith({
                properties: {
                    totals: [{
                        alias: 'aaa',
                        attributeIdentifier: 'a1',
                        measureIdentifier: 'm1',
                        type: 'sum'
                    }]
                }
            });
            expect(pushDataSpy.mock.calls.length).toBe(1);
        });
    });

    it('should rerender ResponsiveTable with new page value when ResponsiveTable renderer fired onMore', () => {
        const props = createProps({ environment: 'dashboards' });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderer = wrapper.find(TableTransformation).props().tableRenderer();
            renderer.props.onMore({ page: 12 });

            return delay().then(() => {
                const renderer = wrapper.find(TableTransformation).props().tableRenderer();
                expect(renderer.props.page).toBe(12);
            });
        });
    });

    it('should rerender ResponsiveTable with new page value when ResponsiveTable renderer fired onLess', () => {
        const props = createProps({ environment: 'dashboards' });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const renderer = wrapper.find(TableTransformation).props().tableRenderer();
            renderer.props.onMore({ page: 12 });

            return delay().then(() => {
                const newRenderer = wrapper.find(TableTransformation).props().tableRenderer();
                expect(newRenderer.props.page).toBe(12);

                renderer.props.onLess();
                return delay().then(() => {
                    const newestRenderer = wrapper.find(TableTransformation).props().tableRenderer();
                    expect(newestRenderer.props.page).toBe(1);
                });
            });
        });
    });

    it('should provide converted totals based on resultSpec to the TableTransformation', () => {
        const props = createProps({
            dataSource: executionObjectWithTotalsDataSource,
            resultSpec: executionObjectWithTotals.execution.resultSpec
        });
        const wrapper = createComponent(props);

        return delay().then(() => {
            const totals = wrapper.find(TableTransformation).props().totals;
            expect(totals).toEqual([{
                outputMeasureIndexes: [0, 1], type: 'sum'
            }, {
                outputMeasureIndexes: [0], type: 'avg'
            }]);
        });
    });

    describe('lastAddedTotalType', () => {
        const defaultProps = createProps({
            totals: [{
                type: 'sum',
                measureIdentifier: '',
                attributeIdentifier: ''
            }, {
                type: 'avg',
                measureIdentifier: '',
                attributeIdentifier: ''
            }]
        });

        it('should set correct "lastAddedTotalType" when component receives new props', () => {
            const wrapper = createComponent(defaultProps);

            return delay().then(() => {
                wrapper.setProps({
                    totals: [{
                        type: 'nat',
                        measureIdentifier: '',
                        attributeIdentifier: ''
                    }]
                });

                return delay().then(() => {
                    const renderedTableTransformation = wrapper.find(TableTransformation);
                    expect(renderedTableTransformation.props().lastAddedTotalType).toEqual('nat');
                });
            });
        });

        it('should set "lastAddedTotalType" as empty when "onLastAddedTotalRowHighlightPeriodEnd" is called', () => {
            const wrapper = createComponent(defaultProps);

            return delay().then(() => {
                wrapper.setProps({
                    totals: [{
                        type: 'nat',
                        measureIdentifier: '',
                        attributeIdentifier: ''
                    }]
                });

                return delay().then(() => {
                    const renderedTableTransformation = wrapper.find(TableTransformation);
                    expect(renderedTableTransformation.props().lastAddedTotalType).toEqual('nat');

                    renderedTableTransformation.props().onLastAddedTotalRowHighlightPeriodEnd();
                    expect(renderedTableTransformation.props().lastAddedTotalType).toEqual('');
                });
            });
        });
    });
});
