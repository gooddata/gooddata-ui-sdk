// (C) 2007-2018 GoodData Corporation
import React from "react";
import { injectIntl } from "react-intl";
import MediaQuery from "react-responsive";
import {
    filterAttributeElements,
    IAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isAttributeElementsByValue,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend, IAttributeElement } from "@gooddata/sdk-backend-spi";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown";
import {
    defaultErrorHandler,
    IntlTranslationsProvider,
    IntlWrapper,
    ITranslationsComponentProps,
    OnError,
    withContexts,
} from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants";
import { getObjRef, getValidElementsFilters } from "./utils/AttributeFilterUtils";

/**
 * @public
 */
export interface IAttributeFilterProps {
    /**
     * Optionally specify an instance of analytical backend instance to work with.
     *
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Optionally specify workspace to work with.
     *
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the filter prop.
     *
     * @deprecated - use the filter prop instead
     */
    identifier?: string;

    /**
     * Specify an attribute filter that will be customized using this filter. The component will use content of the
     * filter and select the items that are already specified on the filter.
     */
    filter?: IAttributeFilter;

    /**
     * Specify a parent attribute filter that will be used to reduce options for available components options.
     */
    parentFilters?: IAttributeFilter[];

    /**
     * Specify and parent filter attribute ref over which should be available options reduced.
     */
    parentFilterOverAttribute?: ObjRef;

    /**
     * Specify function which will be called when user clicks 'Apply' button. The function will receive the current
     * specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply: (filter: IAttributeFilter) => void;

    /**
     * Optionally specify title for the attribute filter. By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Optionally customize whether selected items should be summarized in the title of the filter - so that
     * they are visible even if the filter is closed.
     */
    titleWithSelection?: boolean;

    /**
     * Optionally customize, whether the filter should take the entire screen on mobile devices.
     */
    fullscreenOnMobile?: boolean;

    /**
     * Optionally customize locale to use for the different strings that appear on the filter component.
     */
    locale?: string;

    /**
     * Optionally customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: OnError;

    /**
     * Optionally customize attribute filter with a component to be rendered if attribute elements are loading
     */
    FilterLoading?: React.ComponentType;

    /**
     * Optionally customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<{ error?: any }>;
}

interface IAttributeFilterState {
    title: string;
    isLoading: boolean;
    error?: any;
}

const DefaultFilterError: React.FC = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error s-button-error">{text}</div>;
});

class AttributeFilterCore extends React.PureComponent<IAttributeFilterProps, IAttributeFilterState> {
    public static defaultProps = {
        locale: "en-US",
        FilterError: DefaultFilterError,
        fullscreenOnMobile: false,
        onError: defaultErrorHandler,
        titleWithSelection: false,
    };

    public state: IAttributeFilterState = {
        title: "",
        error: null,
        isLoading: false,
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

    public render() {
        const {
            locale,
            workspace,
            backend,
            FilterError,
            titleWithSelection,
            fullscreenOnMobile,
            parentFilters,
            parentFilterOverAttribute,
        } = this.props;
        const { error, isLoading } = this.state;
        const { isInverted, selectedItems } = this.getInitialDropdownSelection();

        return (
            <IntlWrapper locale={locale}>
                {error ? (
                    <FilterError error={error} />
                ) : (
                    <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                        {(isMobile) => (
                            <IntlTranslationsProvider>
                                {(translationProps: ITranslationsComponentProps) => {
                                    return (
                                        <AttributeDropdown
                                            titleWithSelection={titleWithSelection}
                                            displayForm={getObjRef(this.props.filter, this.props.identifier)}
                                            backend={backend}
                                            workspace={workspace}
                                            onApply={this.onApply}
                                            title={this.props.title || this.state.title}
                                            isInverted={isInverted}
                                            selectedItems={selectedItems}
                                            isLoading={isLoading}
                                            translationProps={translationProps}
                                            isMobile={isMobile}
                                            fullscreenOnMobile={fullscreenOnMobile}
                                            parentFilters={getValidElementsFilters(
                                                parentFilters,
                                                parentFilterOverAttribute,
                                            )}
                                        />
                                    );
                                }}
                            </IntlTranslationsProvider>
                        )}
                    </MediaQuery>
                )}
            </IntlWrapper>
        );
    }

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeFilter", this.props);
    };

    private getSelectedItems = (elements: IAttributeElements): Array<Partial<IAttributeElement>> => {
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
            return {
                isInverted: true,
                selectedItems: [],
            };
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
        const { filter, identifier } = this.props;
        this.setState({ error: null, isLoading: true });

        try {
            const attributes = this.getBackend().workspace(this.props.workspace).attributes();
            const displayForm = await attributes.getAttributeDisplayForm(getObjRef(filter, identifier));
            const attribute = await attributes.getAttribute(displayForm.attribute);

            this.setState({ title: attribute.title, error: null, isLoading: false });
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
            getObjRef(this.props.filter, this.props.identifier),
            useUriElements
                ? { uris: selectedItems.map((item) => item.uri) }
                : { values: selectedItems.map((item) => item.title) },
        );

        return this.props.onApply(filter);
    };
}

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 *
 * @public
 */

export const AttributeFilter = withContexts(AttributeFilterCore);
