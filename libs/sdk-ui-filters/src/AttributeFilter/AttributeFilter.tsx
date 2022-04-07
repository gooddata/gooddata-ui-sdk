// (C) 2007-2022 GoodData Corporation
import React, { useEffect } from "react";
import { injectIntl } from "react-intl";
import MediaQuery from "react-responsive";
import {
    filterAttributeElements,
    IAttributeFilter,
    isAttributeElementsByRef,
    isPositiveAttributeFilter,
    newNegativeAttributeFilter,
    newPositiveAttributeFilter,
    ObjRef,
    IAttributeElement,
} from "@gooddata/sdk-model";
import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { AttributeDropdown } from "./AttributeDropdown/AttributeDropdown";
import {
    AttributeFiltersOrPlaceholders,
    defaultErrorHandler,
    IntlTranslationsProvider,
    IntlWrapper,
    IPlaceholder,
    ITranslationsComponentProps,
    OnError,
    useCancelablePromise,
    usePlaceholder,
    useResolveValueWithPlaceholders,
    withContexts,
} from "@gooddata/sdk-ui";
import { MediaQueries } from "../constants";
import {
    attributeElementsToAttributeElementArray,
    getObjRef,
    getParentFilterTitles,
    getValidElementsFilters,
} from "./utils/AttributeFilterUtils";
import invariant from "ts-invariant";
import stringify from "json-stable-stringify";

/**
 * @public
 */
export interface IAttributeFilterProps {
    /**
     * Specify an instance of analytical backend instance to work with.
     *
     * @remarks
     * Note: if you do not have a BackendProvider above in the component tree, then you MUST specify the backend.
     */
    backend?: IAnalyticalBackend;

    /**
     * Specify workspace to work with.
     *
     * @remarks
     * Note: if you do not have a WorkspaceProvider above in the component tree, then you MUST specify the workspace.
     */
    workspace?: string;

    /**
     * Specify identifier of attribute, for which you want to construct the filter.
     *
     * @remarks
     * Note: this is optional and deprecated. If you do not specify this, then you MUST specify the filter prop.
     *
     * @deprecated - use the filter prop instead
     */
    identifier?: string;

    /**
     * Specify an attribute filter that will be customized using this filter.
     *
     * @remarks
     * The component will use content of the filter and select the items that are already specified on the filter.
     */
    filter?: IAttributeFilter;

    /**
     * Specify a parent attribute filter that will be used to reduce options for available components options.
     *
     * @remarks
     * Parent filters elements must contain their URIs due to current backend limitations.
     */
    parentFilters?: AttributeFiltersOrPlaceholders;

    /**
     * Specify {@link @gooddata/sdk-ui#IPlaceholder} to use to get and set the value of the attribute filter.
     *
     * @remarks
     * Note: It's not possible to combine this property with "filter" property. Either - provide a value, or a placeholder.
     * There is no need to specify 'onApply' callback if 'connectToPlaceholder' property is used as the value of the filter
     * is set via this placeholder.
     */
    connectToPlaceholder?: IPlaceholder<IAttributeFilter>;

    /**
     * Specify the over attribute - an attribute the filter and its parent filter are connected through.
     *
     * @remarks
     * You can either provide an {@link @gooddata/sdk-model#ObjRef} which will be used for all the parent filters,
     * or you can provide a function that will be called for each parent filter to determine the respective over attribute.
     */
    parentFilterOverAttribute?: ObjRef | ((parentFilter: IAttributeFilter, index: number) => ObjRef);

    /**
     * Specify function which will be called when user clicks 'Apply' button.
     *
     * @remarks
     * The function will receive the current specification of the filter, as it was updated by the user.
     *
     * @param filter - new value of the filter.
     */
    onApply?: (filter: IAttributeFilter) => void;

    /**
     * Specify title for the attribute filter.
     *
     * @remarks
     * By default, the attribute name will be used.
     */
    title?: string;

    /**
     * Customize whether selected items should be summarized in the subtitle of the filter.
     *
     * @remarks
     * Subtitle shows the list of selected elements divided by commas.
     */
    titleWithSelection?: boolean;

    /**
     * Customize, whether the filter should take the entire screen on mobile devices.
     */
    fullscreenOnMobile?: boolean;

    /**
     * Customize locale to use for the different strings that appear on the filter component.
     */
    locale?: string;

    /**
     * Customize attribute filter with a callback function to trigger when an error occurs while
     * loading attribute elements.
     */
    onError?: OnError;

    /**
     * Customize attribute filter with a component to be rendered if attribute elements are loading
     */
    FilterLoading?: React.ComponentType;

    /**
     * Customize attribute filter with a component to be rendered if attribute elements loading fails
     */
    FilterError?: React.ComponentType<{ error?: any }>;
}

const DefaultFilterError: React.FC = injectIntl(({ intl }) => {
    const text = intl.formatMessage({ id: "gs.filter.error" });
    return <div className="gd-message error s-button-error">{text}</div>;
});

const AttributeFilterCore: React.FC<IAttributeFilterProps> = (props) => {
    invariant(
        !(props.filter && props.connectToPlaceholder),
        "It's not possible to combine 'filter' property with 'connectToPlaceholder' property. Either provide a value, or a placeholder.",
    );

    invariant(
        !(props.filter && !props.onApply),
        "It's not possible to use 'filter' property without 'onApply' property. Either provide 'onApply' callback or use placeholders.",
    );

    const {
        locale,
        workspace,
        backend,
        FilterError = DefaultFilterError,
        title,
        titleWithSelection = false,
        fullscreenOnMobile = false,
        identifier,
        filter,
        parentFilters,
        connectToPlaceholder,
        parentFilterOverAttribute,
        onError = defaultErrorHandler,
        onApply,
    } = props;

    const resolvedParentFilters = useResolveValueWithPlaceholders(parentFilters);
    const [resolvedPlaceholder, setPlaceholderValue] = usePlaceholder(connectToPlaceholder);

    const currentFilter = resolvedPlaceholder || filter;

    const getBackend = () => {
        return backend.withTelemetry("AttributeFilter", props);
    };

    const {
        result: attributeTitle,
        error: attributeError,
        status: attributeStatus,
    } = useCancelablePromise(
        {
            promise: async () => {
                const attributes = getBackend().workspace(workspace).attributes();
                const displayForm = await attributes.getAttributeDisplayForm(
                    getObjRef(currentFilter, identifier),
                );
                const attribute = await attributes.getAttribute(displayForm.attribute);

                return attribute.title;
            },
        },
        [identifier, workspace],
    );

    const {
        error: parentFilterTitlesError,
        result: parentFilterTitles,
        status: parentFilterTitlesStatus,
    } = useCancelablePromise<string[]>(
        {
            promise: () => getParentFilterTitles(resolvedParentFilters ?? [], getBackend(), props.workspace),
        },
        [props.backend, props.workspace, stringify(resolvedParentFilters)],
    );

    const onFilterApply = (selectedItems: IAttributeElement[], isInverted: boolean) => {
        const useUriElements =
            currentFilter && isAttributeElementsByRef(filterAttributeElements(currentFilter));

        const filterFactory = isInverted ? newNegativeAttributeFilter : newPositiveAttributeFilter;

        const filter = filterFactory(
            getObjRef(currentFilter, identifier),
            useUriElements
                ? { uris: selectedItems.map((item) => item.uri) }
                : { values: selectedItems.map((item) => item.title) },
        );

        if (connectToPlaceholder) {
            setPlaceholderValue(filter);
        }

        return onApply?.(filter);
    };

    useEffect(() => {
        if (attributeError || parentFilterTitlesError) {
            onError(attributeError || parentFilterTitlesError);
        }
    }, [attributeError, parentFilterTitlesError]);

    const getInitialDropdownSelection = () => {
        if (!currentFilter) {
            return {
                isInverted: true,
                selectedItems: [],
            };
        }

        const elements = filterAttributeElements(currentFilter);

        return {
            isInverted: !isPositiveAttributeFilter(currentFilter),
            selectedItems: attributeElementsToAttributeElementArray(elements),
        };
    };

    const { selectedItems, isInverted } = getInitialDropdownSelection();

    return (
        <IntlWrapper locale={locale}>
            {attributeError || parentFilterTitlesError ? (
                <FilterError error={attributeError || parentFilterTitlesError} />
            ) : (
                <MediaQuery query={MediaQueries.IS_MOBILE_DEVICE}>
                    {(isMobile) => (
                        <IntlTranslationsProvider>
                            {(translationProps: ITranslationsComponentProps) => {
                                return (
                                    <AttributeDropdown
                                        titleWithSelection={titleWithSelection}
                                        displayForm={getObjRef(currentFilter, identifier)}
                                        backend={backend}
                                        workspace={workspace}
                                        onApply={onFilterApply}
                                        title={title || attributeTitle}
                                        isInverted={isInverted}
                                        selectedItems={selectedItems}
                                        isLoading={
                                            attributeStatus === "pending" ||
                                            attributeStatus === "loading" ||
                                            parentFilterTitlesStatus == "pending" ||
                                            parentFilterTitlesStatus === "loading"
                                        }
                                        translationProps={translationProps}
                                        isMobile={isMobile}
                                        fullscreenOnMobile={fullscreenOnMobile}
                                        parentFilters={getValidElementsFilters(
                                            resolvedParentFilters,
                                            parentFilterOverAttribute,
                                        )}
                                        parentFilterTitles={parentFilterTitles}
                                    />
                                );
                            }}
                        </IntlTranslationsProvider>
                    )}
                </MediaQuery>
            )}
        </IntlWrapper>
    );
};

/**
 * AttributeFilter is a component that renders a dropdown populated with attribute values
 * for specified attribute display form.
 *
 * @public
 */

export const AttributeFilter = withContexts(AttributeFilterCore);
