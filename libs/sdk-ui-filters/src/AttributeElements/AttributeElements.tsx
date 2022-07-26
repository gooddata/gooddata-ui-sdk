// (C) 2007-2022 GoodData Corporation
import React from "react";
import isEqual from "lodash/isEqual";
import {
    IAnalyticalBackend,
    IElementsQueryOptions,
    IElementsQueryResult,
    IElementsQueryAttributeFilter,
} from "@gooddata/sdk-backend-spi";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { defaultErrorHandler, OnError, withContexts } from "@gooddata/sdk-ui";
import stringify from "json-stable-stringify";

import { AttributeElementsDefaultChildren } from "./AttributeElementsDefaultChildren";
import { IAttributeElementsChildren } from "./types";

/**
 * @public
 */
export interface IAttributeElementsProps {
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
     * Specify reference to a display form, whose elements should be listed.
     */
    displayForm: ObjRef;

    /**
     * Customize maximum number of elements to load in a single page.
     *
     * @remarks
     * New elements will be loaded as your code calls loadMore function passed down to your child function.
     */
    limit?: number;

    /**
     * Customize offset to start loading elements from.
     */
    offset?: number;

    /**
     * Specify options that will be passed to the element query, which is responsible for loading the data (
     * this can be used to add server-side filtering)
     */
    options?: IElementsQueryOptions;

    /**
     * Specify error callback.
     */
    onError?: OnError;

    /**
     * Specify filters that restrict the elements.
     */
    filters?: IElementsQueryAttributeFilter[];

    children?(props: IAttributeElementsChildren): React.ReactNode;
}

interface IAttributeElementsState {
    validElements?: IElementsQueryResult;
    isLoading: boolean;
    error?: any;
}

class AttributeElementsCore extends React.PureComponent<IAttributeElementsProps, IAttributeElementsState> {
    public static defaultProps: Partial<IAttributeElementsProps> = {
        options: {},
        children: AttributeElementsDefaultChildren,
        onError: defaultErrorHandler,
    };

    public state: IAttributeElementsState = {
        validElements: null,
        isLoading: true,
        error: null,
    };

    private lastRequestedConfigHash: string = "";

    private getLoadingConfigHash = (props: IAttributeElementsProps): string => {
        return stringify({
            workspace: props.workspace,
            displayForm: props.displayForm,
            offset: props.offset,
            limit: props.limit,
            options: props.options,
            filters: props.filters,
        });
    };

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeElements", this.props);
    };

    public componentDidMount() {
        this.getValidElements();
    }

    public componentDidUpdate(prevProps: IAttributeElementsProps): void {
        const needsInvalidation =
            !areObjRefsEqual(this.props.displayForm, prevProps.displayForm) ||
            !isEqual(this.props.filters, prevProps.filters) ||
            this.props.workspace !== prevProps.workspace ||
            !isEqual(this.props.options, prevProps.options);

        if (needsInvalidation) {
            this.getValidElements();
        }
    }

    public loadMore = async () => {
        // do not execute while still loading
        if (this.state.isLoading) {
            return;
        }

        this.setState({ isLoading: true, error: null });

        try {
            const moreItems = await this.state.validElements.next();

            this.setState((state) => ({
                ...state,
                isLoading: false,
                validElements: {
                    ...state.validElements,
                    ...moreItems,
                    items: [...state.validElements.items, ...moreItems.items],
                },
            }));
        } catch (error) {
            this.setState({ isLoading: false, error });
        }
    };

    public getValidElements = async () => {
        const { workspace, options, displayForm, offset, limit, filters } = this.props;

        this.setState({ isLoading: true, error: null });

        try {
            const configHash = this.getLoadingConfigHash(this.props);
            this.lastRequestedConfigHash = configHash;

            let loader = this.getBackend()
                .workspace(workspace)
                .attributes()
                .elements()
                .forDisplayForm(displayForm)
                .withOffset(offset || 0)
                .withLimit(limit || 50)
                .withOptions(options ?? {});

            if (filters) {
                // only set the attribute filters if needed to make this work on backend that might not support this yet
                loader = loader.withAttributeFilters(filters);
            }

            const elements = await loader.query();

            // only set the result if the data is still relevant
            if (this.lastRequestedConfigHash === configHash) {
                this.setState({ validElements: elements, isLoading: false });
            }
        } catch (error) {
            this.setState({ isLoading: false, error });
            this.props.onError(error);
        }
    };

    public render() {
        const { validElements, isLoading, error } = this.state;
        return this.props.children({
            validElements,
            loadMore: this.loadMore,
            isLoading,
            error,
        });
    }
}

/**
 * AttributeElements is a component that lists attribute values using a children function
 *
 * @public
 */
export const AttributeElements = withContexts(AttributeElementsCore);
