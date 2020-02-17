// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import { injectIntl } from "react-intl";
import {
    IAttributeElement,
    IPositiveAttributeFilter,
    INegativeAttributeFilter,
    filterAttributeDisplayForm,
    isPositiveAttributeFilter,
    filterAttributeElements,
    isAttributeElementsByValue,
    AttributeElements,
    isAttributeElementsByRef,
    IAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
    idRef,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown";
import { defaultErrorHandler, OnError, IntlWrapper } from "@gooddata/sdk-ui";

interface IAttributeFilterProps {
    backend: IAnalyticalBackend;
    workspace: string;

    identifier?: string;
    filter?: IPositiveAttributeFilter | INegativeAttributeFilter;
    title?: string;

    onApply: (filter: IAttributeFilter) => void;
    fullscreenOnMobile?: boolean;
    locale?: string;
    FilterLoading?: React.ComponentType;
    FilterError?: React.ComponentType<{ error?: any }>;

    onError?: OnError;
}

interface IAttributeFilterState {
    title: string;
    isLoading: boolean;
    error?: any;
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
    return <div className="gd-message error s-button-error">{text}</div>;
});

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 * TODO: SDK8: add docs
 * @public
 */
export class AttributeFilter extends React.PureComponent<IAttributeFilterProps, IAttributeFilterState> {
    public static defaultProps = {
        locale: "en-US",
        FilterLoading: DefaultFilterLoading,
        FilterError: DefaultFilterError,
        fullscreenOnMobile: false,
        onError: defaultErrorHandler,
    };

    public state: IAttributeFilterState = {
        title: "",
        error: null,
        isLoading: false,
    };

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    public componentDidMount(): void {
        this.loadAttributeTitle();
    }

    public componentDidUpdate(prevProps: IAttributeFilterProps): void {
        const needsNewTitleLoad =
            prevProps.identifier !== this.props.identifier || prevProps.workspace !== this.props.workspace;

        if (needsNewTitleLoad) {
            this.loadAttributeTitle(true);
        }
    }

    private getObjRef = (): ObjRef => {
        const { filter, identifier } = this.props;

        if (filter && identifier) {
            throw new Error("Don't use both identifier and filter to specify the attribute to filter");
        }

        if (filter) {
            return filterAttributeDisplayForm(filter);
        }

        if (identifier) {
            // tslint:disable-next-line:no-console
            console.warn(
                "Definition of an attribute using 'identifier' is deprecated, use 'filter' property instead. Please see the documentation of [AttributeFilter component](https://sdk.gooddata.com/gooddata-ui/docs/attribute_filter_component.html) for further details.",
            );
            return idRef(identifier);
        }
    };

    private getSelectedItems = (elements: AttributeElements): Array<Partial<IAttributeElement>> => {
        if (isAttributeElementsByValue(elements)) {
            return elements.values.map(
                (title): Partial<IAttributeElement> => ({
                    title,
                }),
            );
        } else if (isAttributeElementsByRef(elements)) {
            return elements.uris.map(
                (uri): Partial<IAttributeElement> => ({
                    uri,
                }),
            );
        }
        return [];
    };

    private getInitialDropdownSelection = () => {
        const { filter } = this.props;
        if (!filter) {
            return {};
        }

        const elements = filterAttributeElements(filter);

        return {
            isInverted: !isPositiveAttributeFilter(filter),
            selectedItems: this.getSelectedItems(elements),
        };
    };

    private loadAttributeTitle = async (force = false) => {
        if (!force && this.state.isLoading) {
            return;
        }

        this.setState({ error: null, isLoading: true });

        try {
            const displayForm = await this.getBackend()
                .workspace(this.props.workspace)
                .metadata()
                .getAttributeDisplayForm(this.getObjRef());

            this.setState({ title: displayForm.title, error: null, isLoading: false });
        } catch (error) {
            this.setState({ title: "", error, isLoading: false });

            this.props.onError(error);
        }
    };

    private onApply = (selectedItems: IAttributeElement[], isInverted: boolean) => {
        const useUriElements =
            this.props.filter && isAttributeElementsByRef(filterAttributeElements(this.props.filter));

        const filterFactory = isInverted ? newNegativeAttributeFilter : newPositiveAttributeFilter;

        const filter = filterFactory(
            this.getObjRef(),
            useUriElements
                ? { uris: selectedItems.map(item => item.uri) }
                : { values: selectedItems.map(item => item.title) },
        );

        return this.props.onApply(filter);
    };

    public render() {
        const { locale, workspace, backend, FilterError, FilterLoading } = this.props;
        const { error, isLoading } = this.state;

        const { isInverted, selectedItems } = this.getInitialDropdownSelection();

        return (
            <IntlWrapper locale={locale}>
                {isLoading ? (
                    <FilterLoading />
                ) : error ? (
                    <FilterError error={error} />
                ) : (
                    <AttributeDropdown
                        displayForm={this.getObjRef()}
                        backend={backend}
                        workspace={workspace}
                        onApply={this.onApply}
                        title={this.props.title || this.state.title}
                        isInverted={isInverted}
                        selectedItems={selectedItems}
                    />
                )}
            </IntlWrapper>
        );
    }
}
