// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { SDK, factory as createSdk } from "@gooddata/gd-bear-client";
import { IAnalyticalBackend, Element } from "@gooddata/sdk-backend-spi";

import { IntlWrapper } from "../../base/translations/IntlWrapper";
import { injectIntl } from "react-intl";
import { AttributeDropdown } from "./AttributeDropdown";
import { AttributeLoader } from "./AttributeLoader";
import { IAttributeDisplayForm } from "./model";
import { setTelemetryHeaders } from "../../base/helpers/utils";
import { AttributeDropdown as AttributeDropdownNew } from "./AttributeDropdown/AttributeDropdown";

export interface IAttributeFilterProps {
    backend: IAnalyticalBackend;
    // workspace: string;
    identifier: string;

    sdk?: SDK;
    uri?: string;
    projectId?: string;
    metadata?: {
        getObjectUri: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
        getObjectDetails: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    };
    onApply: (selectedItems: Element[], isInverted: boolean) => void;
    fullscreenOnMobile?: boolean;
    locale?: string;
    FilterLoading?: any;
    FilterError?: any;
}

const DefaultFilterLoading = injectIntl(({ intl }) => {
    return (
        <button className="gd-button gd-button-secondary gd-button-small icon-right icon disabled s-button-loading">
            {intl.formatMessage({ id: "gs.filter.loading" })}
        </button>
    );
});

const DefaultFilterError = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error">{text}</div>;
});

/**
 * AttributeFilter
 * is a component that renders a dropdown populated with attribute values
 */
export class AttributeFilter extends React.PureComponent<IAttributeFilterProps> {
    public static defaultProps: Partial<IAttributeFilterProps> = {
        uri: null,
        identifier: null,
        projectId: null,
        locale: "en-US",

        FilterLoading: DefaultFilterLoading,
        FilterError: DefaultFilterError,
        fullscreenOnMobile: false,
    };

    private sdk: SDK;

    constructor(props: IAttributeFilterProps) {
        super(props);

        const sdk = props.sdk || createSdk();
        this.sdk = sdk.clone();
        setTelemetryHeaders(this.sdk, "AttributeFilter", props);
    }

    public UNSAFE_componentWillReceiveProps(nextProps: IAttributeFilterProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, "AttributeFilter", nextProps);
        }
    }

    public render() {
        const { locale, projectId, uri, identifier, backend, onApply } = this.props;
        const { md } = this.sdk;
        return (
            <IntlWrapper locale={locale}>
                <div>
                    <AttributeDropdownNew
                        identifier={identifier}
                        backend={backend}
                        workspace={projectId}
                        onApply={onApply}
                        title="FOO" // TODO
                    />
                    <AttributeLoader uri={uri} identifier={identifier} projectId={projectId} metadata={md}>
                        {props => this.renderContent(props)}
                    </AttributeLoader>
                </div>
            </IntlWrapper>
        );
    }

    private renderContent({
        isLoading,
        attributeDisplayForm,
    }: {
        isLoading: boolean;
        attributeDisplayForm: IAttributeDisplayForm;
    }) {
        if (isLoading) {
            return <this.props.FilterLoading />;
        }

        const { projectId, onApply, fullscreenOnMobile } = this.props;

        const isUsingIdentifier = this.props.identifier !== null;
        const { md } = this.sdk;
        return (
            <AttributeDropdown
                attributeDisplayForm={attributeDisplayForm}
                metadata={md}
                projectId={projectId}
                onApply={onApply}
                fullscreenOnMobile={fullscreenOnMobile}
                isUsingIdentifier={isUsingIdentifier}
            />
        );
    }
}
