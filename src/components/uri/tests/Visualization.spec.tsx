import * as React from 'react';
import { mount } from 'enzyme';
import { IntlProvider } from 'react-intl';
import { ISdk } from 'gooddata';
import {
    Table,
    BaseChart,
    LoadingComponent,
    ErrorComponent
} from '../../tests/mocks';
import { charts, visualizationClasses } from '../../../../__mocks__/fixtures';

import { AFM, VisualizationObject, VisualizationClass } from '@gooddata/typings';
import { Visualization, IntlVisualization, VisualizationWrapped } from '../Visualization';
import { ErrorStates } from '../../../constants/errorStates';
import { delay } from '../../tests/utils';
import { SortableTable } from '../../core/SortableTable';
import { IntlWrapper, messagesMap } from '../../core/base/IntlWrapper';
import { VisualizationTypes } from '../../../constants/visualizationTypes';

const projectId = 'myproject';
const CHART_URI = `/gdc/md/${projectId}/obj/1`;
const TABLE_URI = `/gdc/md/${projectId}/obj/2`;
const CHART_IDENTIFIER = 'chart';
const TABLE_IDENTIFIER = 'table';

const SLOW = 20;
const FAST = 5;

function createIntlMock() {
    const intlProvider = new IntlProvider({ locale: 'en-US', messages: messagesMap['en-US'] }, {});
    const { intl } = intlProvider.getChildContext();
    return intl;
}

function getResponse(response: string, delay: number): Promise<string> {
    return new Promise((resolve) => {
        setTimeout(() => resolve(response), delay);
    });
}

// tslint:disable-next-line:variable-name
function fetchVisObject(_sdk: ISdk, uri: string): Promise<VisualizationObject.IVisualizationObject> {
    const visObj = charts.find(chart => chart.visualizationObject.meta.uri === uri);

    if (!visObj) {
        throw new Error(`Unknown uri ${uri}`);
    }

    return Promise.resolve(visObj.visualizationObject);
}

function fetchVisualizationClass(
    // tslint:disable-next-line:variable-name
    _sdk: ISdk,
    visualizationClassUri: string
): Promise<VisualizationClass.IVisualizationClass> {
    const visClass = visualizationClasses.find(vc => vc.visualizationClass.meta.uri === visualizationClassUri);

    if (!visClass) {
        throw new Error(`Unknown uri ${visualizationClassUri}`);
    }

    return Promise.resolve(visClass.visualizationClass);
}

// tslint:disable-next-line:variable-name
function uriResolver(_sdk: ISdk, _projectId: string, uri: string, identifier: string): Promise<string> {
    if (identifier === TABLE_IDENTIFIER || uri === TABLE_URI) {
        return getResponse(TABLE_URI, FAST);
    }

    if (identifier === CHART_IDENTIFIER || uri === CHART_URI) {
        return getResponse(CHART_URI, SLOW);
    }

    return Promise.reject('Unknown identifier');
}

describe('Visualization', () => {
    it('should construct and provide intl', () => {
        const wrapper = mount(
            <Visualization
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                uriResolver={uriResolver}
                BaseChartComponent={BaseChart}
            />
        );

        return delay(FAST + 1).then(() => {
            expect(wrapper.find(IntlWrapper).length).toBe(1);
            expect(wrapper.find(IntlVisualization).length).toBe(1);
        });
    });
});

describe('VisualizationWrapped', () => {
    const intl = createIntlMock();

    it('should render chart', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                uriResolver={uriResolver}
                BaseChartComponent={BaseChart}
                intl={intl}
            />
        );

        return delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it('should render table', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={TABLE_IDENTIFIER}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                uriResolver={uriResolver}
                intl={intl}
            />
        );

        const expectedResultSpec: AFM.IResultSpec = {
            dimensions: [
                {
                    itemIdentifiers: ['a1'],
                    totals: [
                        {
                            attributeIdentifier: 'a1',
                            measureIdentifier: 'm1',
                            type: 'avg'
                        }
                    ]
                },
                {
                    itemIdentifiers: ['measureGroup']
                }
            ],
            sorts: [
                {
                    attributeSortItem: {
                        attributeIdentifier: 'a1', direction: 'asc'
                    }
                }
            ]
        };

        const expectedTotals: VisualizationObject.IVisualizationTotal[] = [
            {
                type: 'avg',
                alias: 'average',
                measureIdentifier: 'm1',
                attributeIdentifier: 'a1'
            }
        ];

        return delay(SLOW).then(() => {
            wrapper.update();
            expect(wrapper.find(SortableTable).length).toBe(1);
            expect(wrapper.state('type')).toEqual(VisualizationTypes.TABLE);
            expect(wrapper.state('dataSource')).not.toBeNull();
            expect(wrapper.state('resultSpec')).toEqual(expectedResultSpec);
            expect(wrapper.state('totals')).toEqual(expectedTotals);
        });
    });

    it('should render with uri', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                uri={CHART_URI}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                uriResolver={uriResolver}
                BaseChartComponent={BaseChart}
                intl={intl}
            />
        );

        return delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
        });
    });

    it('should trigger error in case of given uri is not valid', (done) => {
        const errorHandler = (value: { status: string }) => {
            expect(value.status).toEqual(ErrorStates.NOT_FOUND);
            done();
        };

        mount(
            <VisualizationWrapped
                projectId={projectId}
                uri={'/invalid/url'}
                onError={errorHandler}
                intl={intl}
            />
        );
    });

    it('should handle slow requests', () => {
        // Response from first request comes back later that from the second one
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
                intl={intl}
            />
        );

        wrapper.setProps({ identifier: TABLE_IDENTIFIER });

        return delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(Table).length).toBe(1);
        });
    });

    it('should handle set state on unmounted component', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={TABLE_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
                intl={intl}
            />
        );

        const spy = jest.spyOn(wrapper.instance(), 'setState');

        // Would throw an error if not handled properly
        wrapper.unmount();
        return delay(FAST + 1).then(() => {
            wrapper.update();
            expect(spy).not.toHaveBeenCalled();
            spy.mockRestore();
        });
    });

    it('should pass LoadingComponent and ErrorComponent to TableComponent', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={TABLE_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
                LoadingComponent={LoadingComponent}
                ErrorComponent={ErrorComponent}
                intl={intl}
            />
        );

        return delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(Table).length).toBe(1);
            const TableElement = wrapper.find(Table).get(0);
            expect(TableElement.props.LoadingComponent).toBe(LoadingComponent);
            expect(TableElement.props.ErrorComponent).toBe(ErrorComponent);
        });
    });

    it('should pass LoadingComponent and ErrorComponent to BaseChart', () => {
        const wrapper = mount(
            <VisualizationWrapped
                projectId={projectId}
                identifier={CHART_IDENTIFIER}
                uriResolver={uriResolver}
                fetchVisObject={fetchVisObject}
                fetchVisualizationClass={fetchVisualizationClass}
                BaseChartComponent={BaseChart}
                TableComponent={Table}
                LoadingComponent={LoadingComponent}
                ErrorComponent={ErrorComponent}
                intl={intl}
            />
        );

        return delay(SLOW + 1).then(() => {
            wrapper.update();
            expect(wrapper.find(BaseChart).length).toBe(1);
            const BaseChartElement = wrapper.find(BaseChart).get(0);
            expect(BaseChartElement.props.LoadingComponent).toBe(LoadingComponent);
            expect(BaseChartElement.props.ErrorComponent).toBe(ErrorComponent);
        });
    });
});
