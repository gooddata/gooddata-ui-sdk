import * as React from 'react';
import { mount } from 'enzyme';
import { test } from '@gooddata/js-utils';
import { IntlTranslationsProvider } from '../TranslationsProvider';
import { Visualization } from '../../../tests/mocks';
import { IntlWrapper } from '../IntlWrapper';

const { postpone } = test;

class Helper extends React.Component<any, any> {
    public render() {
        return (
            <IntlWrapper locale="en-US">
                <IntlTranslationsProvider {...this.props}>
                    <Visualization />
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

describe('TranslationsProvider', () => {
    const createComponent = (props: any) => {
        return mount(<Helper {...props} />);
    };

    it('shouldn\'t change empty data and add numeric symbols', (done) => {
        const result = {
            headers: [],
            rawData: []
        };

        const numericSymbols = ['k', 'M', 'G', 'T', 'P', 'E'];

        const wrapper = createComponent({ result });
        postpone(() => {
            expect(wrapper.find(Visualization).props().data).toEqual(result);
            expect(wrapper.find(Visualization).props().numericSymbols).toEqual(numericSymbols);
            done();
        });
    });

    it('shouldn\'t change reesponse which does not cointain headers or rawData', (done) => {
        const result = { meta: 'someMeta' };
        const wrapper = createComponent({ result });

        postpone(() => {
            expect(wrapper.find(Visualization).props().data).toEqual(result);
            done();
        });
    });

    it('should replace empty attribute values', (done) => {
        const result = {
            headers: [{
                type: 'attrLabel'
            }, {
                type: 'someOther'
            }],
            rawData: [[{
                name: 'valid name',
                key: 'value1.1'
            }, {
                name: '',
                key: 'value1.2'
            }], [{
                name: '',
                key: 'value2.1'
            }, {
                name: 'name',
                key: 'value2.2'
            }], [{
                name: 965,
                key: 'value3.1'
            }, {
                name: 965,
                key: 'value3.2'
            }]]
        };
        const expected = {
            headers: [{
                type: 'attrLabel'
            }, {
                type: 'someOther'
            }],
            rawData: [[{
                name: 'valid name',
                key: 'value1.1'
            }, {
                name: '',
                key: 'value1.2'
            }], [{
                name: '(empty value)',
                key: 'value2.1'
            }, {
                name: 'name',
                key: 'value2.2'
            }], [{
                name: 965,
                key: 'value3.1'
            }, {
                name: 965,
                key: 'value3.2'
            }]]
        };
        const wrapper = createComponent({ result });

        postpone(() => {
            expect(wrapper.find(Visualization).props().data).toEqual(expected);
            done();
        });
    });

});
