import * as React from 'react';
import { IntlProvider } from 'react-intl';
import messages from '@gooddata/indigo-visualizations/lib/translations/en';

export class IntlWrapper extends React.PureComponent<null, null> {
    public render() {
        return (
            <IntlProvider locale="en" messages={messages}>
                {this.props.children}
            </IntlProvider>
        );
    }
}
