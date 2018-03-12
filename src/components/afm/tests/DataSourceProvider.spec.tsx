import * as React from 'react';
import { mount } from 'enzyme';
import { AFM } from '@gooddata/typings';
import {
    dataSourceProvider,
    IDataSourceProviderProps,
    IDataSourceProviderInjectedProps
} from '../DataSourceProvider';
import { Table } from '../../tests/mocks';
import { delay } from '../../tests/utils';

describe('DataSourceProvider', () => {
    const defaultProps = {
        afm: {},
        projectId: 'projid',
        resultSpec: {}
    };

    function generateDefaultDimensions(): AFM.IDimension[] {
        return [];
    }
    function createComponent(
        component: any,
        props: IDataSourceProviderProps = defaultProps
    ) {
        const WrappedComponent = dataSourceProvider(component, generateDefaultDimensions);

        return mount(
            <WrappedComponent {...props} />
        );
    }

    it('should prepare datasource', () => {
        const wrapper = createComponent(Table);

        return delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            expect(table.length).toEqual(1);

            const tableProps = table.props() as IDataSourceProviderInjectedProps;
            expect(tableProps.dataSource).toBeDefined();
        });
    });

    it('should recreate dataSource when projects differ', () => {
        const wrapper = createComponent(Table);
        const newProps: IDataSourceProviderProps = {
            afm: {},
            projectId: 'projid2',
            resultSpec: {}
        };
        return delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            const tableProps: IDataSourceProviderInjectedProps = table.props();
            const oldDataSource = tableProps.dataSource;
            wrapper.setProps(newProps);
            return delay().then(() => {
                wrapper.update();
                const table = wrapper.find(Table);
                const tableProps = table.props() as IDataSourceProviderInjectedProps;
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDataSource);
            });
        });
    });

    it('should recreate datasource when afm changes', () => {
        const wrapper = createComponent(Table);

        const newProps: IDataSourceProviderProps = {
            afm: { measures: [], attributes: [] },
            projectId: 'projid',
            resultSpec: {}
        };

        return delay().then(() => {
            wrapper.update();
            const table = wrapper.find(Table);
            const tableProps: IDataSourceProviderInjectedProps = table.props();
            const oldDataSource = tableProps.dataSource;
            wrapper.setProps(newProps);
            return delay().then(() => {
                wrapper.update();
                const table = wrapper.find(Table);
                const tableProps: IDataSourceProviderInjectedProps = table.props();
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDataSource);
            });
        });
    });

    it('should recreate dataSource only once when all props change', () => {
        const wrapper = createComponent(Table);

        const newProps: IDataSourceProviderProps = {
            afm: {
                measures: [],
                attributes: []
            },
            projectId: 'projid2',
            resultSpec: {
                sorts: [
                    {
                        attributeSortItem: {
                            attributeIdentifier: 'a1',
                            direction: 'desc'
                        }
                    }
                ]
            }
        };

        return delay().then(() => {
            wrapper.update();
            const instance: any = wrapper.instance();
            const prepareDataSourceSpy = jest.spyOn(instance, 'prepareDataSource');
            wrapper.setProps(newProps);
            return delay().then(() => {
                wrapper.update();
                expect(prepareDataSourceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    it('should not render component if dataSource is missing', () => {
        const wrapper = createComponent(Table);

        return delay().then(() => {
            wrapper.update();
            wrapper.setState({ dataSource: null });
            return delay().then(() => {
                wrapper.update();
                expect(wrapper.find(Table).length).toEqual(0);
            });
        });
    });

    it('should provide modified resultSpec to InnerComponent', () => {
        const defaultDimension = () => [{ itemIdentifiers: ['x'] }];
        const WrappedTable = dataSourceProvider(Table, defaultDimension);
        const wrapper = mount(<WrappedTable {...defaultProps} />);

        return delay().then(() => {
            wrapper.update();
            expect(wrapper.find(Table).props().resultSpec.dimensions).toEqual(defaultDimension());
        });
    });
});
