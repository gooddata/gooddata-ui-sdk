import * as React from 'react';
import { mount } from 'enzyme';
import {
    simpleDataAdapterProvider,
    ISimpleDataAdapterProviderProps
} from '../SimpleDataAdapterProvider';
import { Table } from '../../tests/mocks';
import { postpone } from '../../../helpers/test_helpers';

describe('SimpleDataAdapterProvider', () => {
    const defaultProps = {
        afm: {},
        projectId: 'projid',
        transformation: {}
    };

    function createComponent(component, type, props: ISimpleDataAdapterProviderProps = defaultProps) {
        const WrappedComponent = simpleDataAdapterProvider(component, type);

        return mount(
            <WrappedComponent {...props} />
        );
    }

    it('should prepare datasource and metadataSource', (done) => {
        const wrapper = createComponent(Table, 'table');

        postpone(() => {
            expect(wrapper.find(Table).length).toEqual(1);
            expect(wrapper.find(Table).props().dataSource).toBeDefined();
            expect(wrapper.find(Table).props().metadataSource).toBeDefined();
            done();
        });
    });

    it('should recreate DS and MDS when projects differ', (done) => {
        const wrapper = createComponent(Table, 'table');

        const newProps = {
            afm: {},
            projectId: 'projid2',
            transformation: {}
        };
        postpone(() => {
            const oldDs = wrapper.find(Table).props().dataSource;
            const oldMds = wrapper.find(Table).props().metadataSource;
            wrapper.setProps(newProps, () => {
                postpone(() => {
                    expect(wrapper.find(Table).length).toEqual(1);
                    expect(wrapper.find(Table).props().dataSource).not.toBe(oldDs);
                    expect(wrapper.find(Table).props().metadataSource).not.toBe(oldMds);
                    done();
                });
            });
        });
    });

    it('should recreate DS and MDS when afm changes', (done) => {
        const wrapper = createComponent(Table, 'table');

        const newProps = {
            afm: { measures: [], attributes: [] },
            projectId: 'projid',
            transformation: {}
        };
        postpone(() => {
            const oldDs = wrapper.find(Table).props().dataSource;
            const oldMds = wrapper.find(Table).props().metadataSource;
            wrapper.setProps(newProps, () => {
                postpone(() => {
                    expect(wrapper.find(Table).length).toEqual(1);
                    expect(wrapper.find(Table).props().dataSource).not.toBe(oldDs);
                    expect(wrapper.find(Table).props().metadataSource).not.toBe(oldMds);
                    done();
                });
            });
        });
    });

    it('should recreate MDS when transformation changes', (done) => {
        const wrapper = createComponent(Table, 'table');

        const newProps = {
            afm: {},
            projectId: 'projid',
            transformation: { sorting: { column: 'a', direction: 'b' } }
        };
        postpone(() => {
            const oldDs = wrapper.find(Table).props().dataSource;
            const oldMds = wrapper.find(Table).props().metadataSource;
            wrapper.setProps(newProps, () => {
                postpone(() => {
                    expect(wrapper.find(Table).length).toEqual(1);
                    expect(wrapper.find(Table).props().dataSource).toBe(oldDs);
                    expect(wrapper.find(Table).props().metadataSource).not.toBe(oldMds);
                    done();
                });
            });
        });
    });

    it('should recreate DS and MDS only once when all props change', (done) => {
        const wrapper = createComponent(Table, 'table');

        const newProps = {
            afm: { measures: [], attributes: [] },
            projectId: 'projid2',
            transformation: { sorting: { column: 'a', direction: 'b' } }
        };

        postpone(() => {
            const prepareDataSourceSpy = jest.spyOn(wrapper.node, 'prepareDataSource');
            const prepareMDSourceSpy = jest.spyOn(wrapper.node, 'prepareMDSource');
            wrapper.setProps(newProps, () => {
                postpone(() => {
                    expect(prepareDataSourceSpy).toHaveBeenCalledTimes(1);
                    expect(prepareMDSourceSpy).toHaveBeenCalledTimes(1);
                    done();
                });
            });
        });
    });

    it('should not render component if DS is missing', (done) => {
        const wrapper = createComponent(Table, 'table');

        postpone(() => {
            wrapper.setState({ dataSource: null }, () => {
                postpone(() => {
                    expect(wrapper.find(Table).length).toEqual(0);
                    done();
                });
            });
        });
    });

    it('should not render component if MDS is missing', (done) => {
        const wrapper = createComponent(Table, 'table');

        postpone(() => {
            wrapper.setState({ metadataSource: null }, () => {
                postpone(() => {
                    expect(wrapper.find(Table).length).toEqual(0);
                    done();
                });
            });
        });
    });
});
