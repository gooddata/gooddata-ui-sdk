import * as React from 'react';
import { mount } from 'enzyme';
import { IntlTranslationsProvider, ITranslationsComponentProps } from '../TranslationsProvider';
import { Visualization } from '../../../tests/mocks';
import { IntlWrapper } from '../IntlWrapper';
import { delay } from '../../../tests/utils';

class Helper extends React.Component<any, any> {
    public render() {
        return (
            <IntlWrapper locale="en-US">
                <IntlTranslationsProvider {...this.props}>
                    {(props: ITranslationsComponentProps) => (
                        <Visualization numericSymbols={props.numericSymbols} />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

describe('TranslationsProvider', () => {
    const createComponent = () => {
        return mount(<Helper />);
    };

    it('shouldn add numeric symbols', () => {
        const numericSymbols = ['k', 'M', 'G', 'T', 'P', 'E'];
        const wrapper = createComponent();
        const translationsProviderProps = wrapper.find(Visualization).props() as ITranslationsComponentProps;

        return delay().then(() => {
            expect(translationsProviderProps.numericSymbols).toEqual(numericSymbols);
        });
    });
});
