import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as GoodData from 'gooddata';
import pick = require('lodash/pick');

import { IntlWrapper } from '../../core/base/IntlWrapper';
import { injectIntl } from 'react-intl';
import { AttributeDropdown, AttributeDropdownWrapped, IAttributeDropdownProps } from './AttributeDropdown';
import { AttributeLoader } from './AttributeLoader';
import { IAttributeDisplayForm } from './model';

export interface IAttributeFilterProps {
    uri?: string;
    identifier?: string;
    projectId?: string;
    metadata?: {
        getObjectUri: Function;
        getObjectDetails: Function;
    };

    locale?: string;
    FilterLoading?: any;
    FilterError?: any;
}

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button
            className="button button-secondary button-small icon-right icon disabled s-button-loading"
        >
            {intl.formatMessage({ id: 'gs.filter.loading' })}
        </button>
    );
});

const DefaultFilterError = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: 'gs.filter.error' });
    return <div className="gd-message error">{text}</div>;
});

export class AttributeFilter extends React.PureComponent<IAttributeFilterProps, null> {
    public static propTypes = {
        uri: PropTypes.string,
        identifier: PropTypes.string,
        projectId: PropTypes.string,

        FilterLoading: PropTypes.func,
        FilterError: PropTypes.func,
        locale: PropTypes.string,
        metadata: PropTypes.shape({
            getObjectUri: PropTypes.func.isRequired,
            getObjectDetails: PropTypes.func.isRequired
        })
    };

    public static defaultProps: Partial<IAttributeFilterProps> = {
        uri: null,
        identifier: null,
        projectId: null,
        locale: 'en-US',
        metadata: GoodData.md,

        FilterLoading: DefaultFilterLoading,
        FilterError: DefaultFilterError
    };

    public render() {
        const { locale, projectId, uri, identifier, metadata } = this.props;
        return (
            <IntlWrapper locale={locale}>
                <AttributeLoader uri={uri} identifier={identifier} projectId={projectId} metadata={metadata}>
                    {props => this.renderContent(props)}
                </AttributeLoader>
            </IntlWrapper>
        );
    }

    private renderContent(
        { isLoading, attributeDisplayForm }: {
            isLoading: boolean, attributeDisplayForm: IAttributeDisplayForm }
    ) {
        if (isLoading) {
            return <this.props.FilterLoading />;
        }

        const dropdownProps
            = pick<IAttributeDropdownProps, IAttributeFilterProps>(this.props,
                Object.keys(AttributeDropdownWrapped.propTypes));
        return (
            <AttributeDropdown
                attributeDisplayForm={attributeDisplayForm}
                {...dropdownProps}
            />
        );
    }
}
