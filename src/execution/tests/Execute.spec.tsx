import * as React from 'react';
import { mount } from 'enzyme';
import { Afm, DataTable, DummyAdapter } from '@gooddata/data-layer';
import { IDataTable } from '../../interfaces/DataTable';
import { Execute, IExecuteProps } from '../Execute';
import { test } from '@gooddata/js-utils';

const SLOW = 100;
const FAST = 10;

const { postpone } = test;

const isSlowExecution = afm => afm.attributes.some(attribute => attribute.id === 'slow_execution');

class DataTableWithDelay implements IDataTable {
    public getDelay(afm: Afm.IAfm) {
        if (isSlowExecution(afm)) {
            return SLOW;
        }

        return FAST;
    }

    public execute(afm: Afm.IAfm) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = isSlowExecution(afm) ? { data: 'slow' } : { data: 'fast' };
                resolve(data);
            }, this.getDelay(afm));
        });
    }
}

describe('Execute', () => {
    const data = [1, 2, 3];
    const afm: Afm.IAfm = {
        attributes: [
            {
                id: 'slow_execution',
                type: 'attribute'
            }
        ]
    };

    function dataTableFactory() {
        const adapter = new DummyAdapter(data);
        return new DataTable(adapter);
    }

    function dataTableFactoryWithDelay() {
        return new DataTableWithDelay();
    }

    function createStatelessChild() {
        return jest.fn(props => <span>{JSON.stringify(props.result)}</span>);
    }

    function createComponent(child, props = {}) {
        const defaultProps: IExecuteProps = {
            afm,
            projectId: 'foo',
            onError: jest.fn(),
            onLoadingChanged: jest.fn(),
            dataTableFactory,
            ...props
        };

        return mount(
            <Execute {...defaultProps}>
                {child}
            </Execute>
        );
    }

    it('should pass execution result to its child', (done) => {
        const child = createStatelessChild();
        createComponent(child);

        postpone(() => {
            expect(child).toHaveBeenLastCalledWith({ result: data });
            expect(child).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should dispatch loading before and after execution', (done) => {
        const onLoadingChanged = jest.fn();
        const child = createStatelessChild();
        createComponent(child, {
            onLoadingChanged
        });

        postpone(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
            done();
        });
    });

    it('should not dispatch execution for same AFM', (done) => {
        const child = createStatelessChild();
        const wrapper = createComponent(child);

        wrapper.setProps({
            afm
        });

        postpone(() => {
            expect(child).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should handle slow requests', (done) => {
        const child = createStatelessChild();
        const wrapper = createComponent(child, { dataTableFactory: dataTableFactoryWithDelay });

        const secondAfm: Afm.IAfm = {
            attributes: [
                {
                    id: 'fast_execution',
                    type: 'attribute'
                }
            ]
        };

        wrapper.setProps({ afm: secondAfm });

        postpone(() => {
            expect(JSON.parse(wrapper.text())).toEqual({ data: 'fast' });
            done();
        }, 300);
    });
});
