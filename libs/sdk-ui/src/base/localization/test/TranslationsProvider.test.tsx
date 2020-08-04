// (C) 2007-2018 GoodData Corporation
import React from "react";
import { mount } from "enzyme";
import { testUtils } from "@gooddata/utilities";
import { IntlTranslationsProvider, ITranslationsComponentProps } from "../TranslationsProvider";
import { IntlWrapper } from "../IntlWrapper";

class DummyComponent extends React.Component<any, any> {
    public render() {
        return <div />;
    }
}

class Helper extends React.Component<any, any> {
    public render() {
        return (
            <IntlWrapper locale="en-US">
                <IntlTranslationsProvider {...this.props}>
                    {(props: ITranslationsComponentProps) => (
                        <DummyComponent numericSymbols={props.numericSymbols} />
                    )}
                </IntlTranslationsProvider>
            </IntlWrapper>
        );
    }
}

describe("TranslationsProvider", () => {
    const createComponent = () => {
        return mount(<Helper />);
    };

    it("shouldn add numeric symbols", () => {
        const numericSymbols = ["k", "M", "G", "T", "P", "E"];
        const wrapper = createComponent();
        const translationsProviderProps = wrapper.find(DummyComponent).props() as ITranslationsComponentProps;

        return testUtils.delay().then(() => {
            expect(translationsProviderProps.numericSymbols).toEqual(numericSymbols);
        });
    });
});
