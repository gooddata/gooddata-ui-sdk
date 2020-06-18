// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import isEqual = require("lodash/isEqual");
import { IAnalyticalBackend, IElementQueryOptions, IElementQueryResult } from "@gooddata/sdk-backend-spi";
import { ObjRef, areObjRefsEqual } from "@gooddata/sdk-model";
import { defaultErrorHandler, OnError, withContexts } from "@gooddata/sdk-ui";

import { AttributeElementsDefaultChildren } from "./AttributeElementsDefaultChildren";
import { IAttributeElementsChildren } from "./types";

/**
 * @public
 */
export interface IAttributeElementsProps {
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
     * Specify reference to a display form, whose elements should be listed.
     */
    displayForm: ObjRef;

    /**
     * Optionally customize maximum number of elements to load in a single page. New elements will be loaded
     * as your code calls loadMore function passed down to your child function.
     */
    limit?: number;

    /**
     * Optionally customize offset to start loading elements from.
     */
    offset?: number;

    /**
     * Optionally specify options that will be passed to the element query, which is responsible for loading the data (
     * this can be used to add server-side filtering)
     */
    options?: IElementQueryOptions;

    /**
     * Optionally specify error callback.
     */
    onError?: OnError;

    children?(props: IAttributeElementsChildren): React.ReactNode;
}

interface IAttributeElementsState {
    validElements?: IElementQueryResult;
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

    private getBackend = () => {
        return this.props.backend.withTelemetry("AttributeElements", this.props);
    };

    public componentDidMount() {
        this.getValidElements();
    }

    public componentDidUpdate(prevProps: IAttributeElementsProps): void {
        const needsInvalidation =
            !areObjRefsEqual(this.props.displayForm, prevProps.displayForm) ||
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
        const { workspace, options, displayForm, offset, limit } = this.props;

        this.setState({ isLoading: true, error: null });

        try {
            const elements = await this.getBackend()
                .workspace(workspace)
                .elements()
                .forDisplayForm(displayForm)
                .withOffset(offset || 0)
                .withLimit(limit || 50)
                .withOptions(options)
                .query();

            this.setState({ validElements: elements, isLoading: false });
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
