import * as React from 'react';
import { mount } from 'enzyme';
import {
    simpleDataAdapterProvider,
    ISimpleDataAdapterProviderProps,
    VisType,
    ISimpleDataAdapterProviderInjectedProps
} from '../SimpleDataAdapterProvider';
import { Table } from '../../tests/mocks';

import { VisualizationTypes } from '../../../constants/visualizationTypes';
import { delay } from '../../tests/utils';

describe('SimpleDataAdapterProvider', () => {
    const defaultProps = {
        afm: {},
        projectId: 'projid',
        transformation: {}
    };

    function createComponent(
        component: any,
        type: VisType,
        props: ISimpleDataAdapterProviderProps = defaultProps
    ) {
        const WrappedComponent = simpleDataAdapterProvider(component, type);

        return mount(
            <WrappedComponent {...props} />
        );
    }

    it('should prepare datasource and metadataSource', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        return delay().then(() => {
            const table = wrapper.find(Table);
            expect(table.length).toEqual(1);

            const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
            expect(tableProps.dataSource).toBeDefined();
            expect(tableProps.metadataSource).toBeDefined();
        });
    });

    it('should recreate DS and MDS when projects differ', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);
        const newProps: ISimpleDataAdapterProviderProps = {
            afm: {},
            projectId: 'projid2',
            transformation: {}
        };
        return delay().then(() => {
            const table = wrapper.find(Table);
            const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
            const oldDs = tableProps.dataSource;
            const oldMds = tableProps.metadataSource;
            wrapper.setProps(newProps);
            return delay().then(() => {
                const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDs);
                expect(tableProps.metadataSource).not.toBe(oldMds);
            });
        });
    });

    it('should recreate DS and MDS when afm changes', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        const newProps: ISimpleDataAdapterProviderProps = {
            afm: { measures: [], attributes: [] },
            projectId: 'projid',
            transformation: {}
        };

        return delay().then(() => {
            const table = wrapper.find(Table);
            const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
            const oldDs = tableProps.dataSource;
            const oldMds = tableProps.metadataSource;
            wrapper.setProps(newProps);
            return delay().then(() => {
                const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).not.toBe(oldDs);
                expect(tableProps.metadataSource).not.toBe(oldMds);
            });
        });
    });

    it('should recreate MDS when transformation changes', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        const newProps: ISimpleDataAdapterProviderProps = {
            afm: {},
            projectId: 'projid',
            transformation: {
                sorting: [
                    {
                        column: 'a',
                        direction: 'b'
                    }
                ]
            }
        };

        return delay().then(() => {
            const table = wrapper.find(Table);
            const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
            const oldDs = tableProps.dataSource;
            const oldMds = tableProps.metadataSource;
            wrapper.setProps(newProps);
            return delay().then(() => {
                const tableProps = table.props() as ISimpleDataAdapterProviderInjectedProps;
                expect(table.length).toEqual(1);
                expect(tableProps.dataSource).toBe(oldDs);
                expect(tableProps.metadataSource).not.toBe(oldMds);
            });
        });
    });

    it('should recreate DS and MDS only once when all props change', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        const newProps: ISimpleDataAdapterProviderProps = {
            afm: {
                measures: [],
                attributes: []
            },
            projectId: 'projid2',
            transformation: {
                sorting: [
                    {
                        column: 'a',
                        direction: 'b'
                    }
                ]
            }
        };

        return delay().then(() => {
            const node: any = wrapper.getNode();
            const prepareDataSourceSpy = jest.spyOn(node, 'prepareDataSource');
            const prepareMDSourceSpy = jest.spyOn(node, 'prepareMDSource');
            wrapper.setProps(newProps);
            return delay().then(() => {
                expect(prepareDataSourceSpy).toHaveBeenCalledTimes(1);
                expect(prepareMDSourceSpy).toHaveBeenCalledTimes(1);
            });
        });
    });

    it('should not render component if DS is missing', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        return delay().then(() => {
            wrapper.setState({ dataSource: null });
            return delay().then(() => {
                expect(wrapper.find(Table).length).toEqual(0);
            });
        });
    });

    it('should not render component if MDS is missing', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);

        return delay().then(() => {
            wrapper.setState({ metadataSource: null });
            return delay().then(() => {
                expect(wrapper.find(Table).length).toEqual(0);
            });
        });
    });

    it('should cancel promise when unmounting', () => {
        const wrapper = createComponent(Table, VisualizationTypes.TABLE);
        const cancelDS = jest.fn();
        const cancelMDS = jest.fn();

        const node: any = wrapper.getNode();
        node.prepareDataSourceCancellable = { cancel: cancelDS };
        node.prepareMetadataSourceCancellable = { cancel: cancelMDS };

        return delay().then(() => {
            wrapper.unmount();
            expect(cancelDS).toHaveBeenCalled();
            expect(cancelMDS).toHaveBeenCalled();
        });
    });
});
