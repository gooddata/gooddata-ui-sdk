// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { mount, ReactWrapper } from 'enzyme';
import { InjectedIntlProps } from 'react-intl';
import { ITableSortBubbleContentProps, TableSortBubbleContent } from '../TableSortBubbleContent';
import { ASC, DESC } from '../../../../constants/sort';
import { withIntl } from '../../utils/intlUtils';

describe('TableSortBubbleContent', () => {
    function createBubble(customProps = {}): ReactWrapper<ITableSortBubbleContentProps & InjectedIntlProps> {
        const props: ITableSortBubbleContentProps = {
            title: 'Foo',
            ...customProps
        };
        const WrappedBubble: React.ComponentClass<ITableSortBubbleContentProps> = withIntl(TableSortBubbleContent);
        return mount(
            <WrappedBubble {...props} />
        );
    }

    it('should render 2 sort buttons', () => {
        const wrapper: ReactWrapper<ITableSortBubbleContentProps & InjectedIntlProps> = createBubble();
        expect(wrapper.find('.button-sort-asc')).toHaveLength(1);
        expect(wrapper.find('.button-sort-desc')).toHaveLength(1);
    });

    it('should trigger sort callback on button click & close', () => {
        const onSortChange = jest.fn();
        const props: Partial<ITableSortBubbleContentProps> = {
            onSortChange,
            onClose: jest.fn()
        };
        const wrapper: ReactWrapper<ITableSortBubbleContentProps & InjectedIntlProps> = createBubble(props);

        wrapper.find('.button-sort-asc').simulate('click');
        expect(onSortChange.mock.calls[0][0]).toEqual(ASC);

        wrapper.find('.button-sort-desc').simulate('click');
        expect(onSortChange.mock.calls[1][0]).toEqual(DESC);

        expect(props.onClose).toHaveBeenCalledTimes(2);
    });

    it('should trigger close callback on cross button click', () => {
        const props: Partial<ITableSortBubbleContentProps> = {
            onClose: jest.fn()
        };
        const wrapper: ReactWrapper<ITableSortBubbleContentProps & InjectedIntlProps> = createBubble(props);
        wrapper.find('.close-button').simulate('click');

        expect(props.onClose).toHaveBeenCalledTimes(1);
    });
});
