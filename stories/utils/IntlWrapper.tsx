// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';

import translations from '../../src/components/visualizations/mock-translations/en';

export default class IntlWrap extends React.PureComponent {
    public static propTypes = {
        children: PropTypes.node.isRequired
    };

    public render() {
        return (
            <IntlProvider
                locale="en"
                messages={translations}
            >
                {this.props.children}
            </IntlProvider>
        );
    }
}
