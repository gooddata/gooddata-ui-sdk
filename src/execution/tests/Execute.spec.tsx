import * as React from 'react';
import { mount } from 'enzyme';
import { DataTable, DummyAdapter } from '@gooddata/data-layer';
import { AFM } from '@gooddata/typings';
import { Execute, IExecuteProps } from '../Execute';
import { delay } from '../../components/tests/utils';

describe('Execute', () => {
    const data = [1, 2, 3];
    const afm: AFM.IAfm = {
        attributes: [
            {
                localIdentifier: 'a1',
                displayForm: {
                    identifier: 'slow_execution'
                }
            }
        ]
    };

    function dataTableFactory() {
        const adapter = new DummyAdapter(data);
        return new DataTable(adapter);
    }

    function createStatelessChild() {
        return jest.fn(props => <span>{JSON.stringify(props.result)}</span>);
    }

    function createComponent(child: Function, props = {}) {
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

    it('should pass execution result to its child', () => {
        const child = createStatelessChild();
        createComponent(child);

        return delay().then(() => {
            expect(child).toHaveBeenLastCalledWith({ result: data });
            expect(child).toHaveBeenCalledTimes(1);
        });
    });

    it('should dispatch loading before and after execution', () => {
        const onLoadingChanged = jest.fn();
        const child = createStatelessChild();
        createComponent(child, {
            onLoadingChanged
        });

        return delay().then(() => {
            expect(onLoadingChanged).toHaveBeenCalledTimes(2);
        });
    });

    it('should not dispatch execution for same AFM', () => {
        const child = createStatelessChild();
        const wrapper = createComponent(child);

        wrapper.setProps({
            afm
        });

        return delay().then(() => {
            expect(child).toHaveBeenCalledTimes(1);
        });
    });
});
