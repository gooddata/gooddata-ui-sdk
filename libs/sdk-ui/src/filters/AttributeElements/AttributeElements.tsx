// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import isEqual = require("lodash/isEqual");
import { IAnalyticalBackend, IElementQueryOptions, IElementQueryResult } from "@gooddata/sdk-backend-spi";
import { defaultErrorHandler, OnError } from "../../base";

import { AttributeElementsDefaultChildren } from "./AttributeElementsDefaultChildren";
import { IAttributeElementsChildren } from "./types";

export interface IAttributeElementsProps {
    backend: IAnalyticalBackend;
    workspace: string;
    identifier: string;

    limit?: number;
    offset?: number;
    options?: IElementQueryOptions;
    children?(props: IAttributeElementsChildren): React.ReactNode;
    onError?: OnError;
}

interface IAttributeElementsState {
    validElements?: IElementQueryResult;
    isLoading: boolean;
    error?: any;
}

/**
 * AttributeElements
 * is a component that lists attribute values using a children function
 */
export class AttributeElements extends React.PureComponent<IAttributeElementsProps, IAttributeElementsState> {
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
            this.props.identifier !== prevProps.identifier ||
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

            this.setState(state => ({
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
        const { workspace, options, identifier, offset, limit } = this.props;

        this.setState({ isLoading: true, error: null });

        try {
            const elements = await this.getBackend()
                .workspace(workspace)
                .elements()
                .forObject(identifier)
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
