// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import { SDK, factory as createSdk, IValidElementsResponse, IElement } from "@gooddata/gooddata-js";
import { IValidElementsOptions } from "@gooddata/gooddata-js/lib/metadata";
import { AFM } from "@gooddata/typings";
import get = require("lodash/get");
import isEqual = require("lodash/isEqual");
import { getObjectIdFromUri, setTelemetryHeaders } from "../../../helpers/utils";
import { ErrorStates } from "../../../index";

export interface IPaging {
    count: number;
    offset: number;
    total: number;
}

export interface IAttributeElementsProps {
    sdk?: SDK;
    projectId: string;
    uri?: string;
    identifier?: string;
    options?: IValidElementsOptions;

    children?(props: IAttributeElementsChildren): any;
}

export interface IValidElements {
    items: IElement[];
    paging: IPaging;
    elementsMeta: {
        attribute: string;
        attributeDisplayForm: string;
        filter: string;
        order: AFM.SortDirection;
    };
}

export interface IAttributeElementsState {
    validElements?: IValidElements;
    isLoading: boolean;
    error?: any;
}

export interface IAttributeElementsChildren {
    validElements: IValidElements;
    loadMore: () => void;
    isLoading: boolean;
    error: any;
}

const defaultChildren = ({ validElements, loadMore, isLoading, error }: IAttributeElementsChildren) => {
    const paging: Partial<IPaging> = validElements ? validElements.paging : {};
    const { offset = 0, count = null, total = null } = paging;
    const nextOffset = count + offset;
    if (error) {
        return <div>{error}</div>;
    }
    return (
        <div>
            <p>
                Use children function to map {"{"} validElements, loadMore, isLoading {"} "}
                to your React components.
            </p>
            <button
                className="gd-button gd-button-secondary"
                onClick={loadMore as any}
                disabled={isLoading || offset + count === total}
            >
                More
            </button>
            <h2>validElements</h2>
            <pre>
                isLoading: {isLoading.toString()}
                offset: {offset}
                count: {count}
                total: {total}
                nextOffset: {nextOffset}
                validElements:
                {JSON.stringify(validElements, null, "\t")}
            </pre>
        </div>
    );
};

/**
 * AttributeElements
 * is a component that lists attribute values using a children function
 */
export class AttributeElements extends React.PureComponent<IAttributeElementsProps, IAttributeElementsState> {
    public static propTypes = {
        projectId: PropTypes.string.isRequired,
        uri: PropTypes.string,
        identifier: PropTypes.string,
        options: PropTypes.object,
    };

    public static defaultProps: Partial<IAttributeElementsProps> = {
        projectId: null,
        uri: null,
        identifier: null,
        options: null,
        children: defaultChildren,
    };

    private uri?: string = null;
    private getValidElementsPromise?: Promise<any> = null;

    private sdk: SDK;

    constructor(props: IAttributeElementsProps) {
        super(props);

        this.state = {
            validElements: null,
            isLoading: true,
            error: null,
        };

        const sdk = props.sdk || createSdk();
        this.sdk = sdk.clone();
        setTelemetryHeaders(this.sdk, "AttributeElements", props);

        this.loadMore = this.loadMore.bind(this);
    }

    public componentDidMount() {
        this.getValidElements(this.props, get(this.props, "options.offset", 0));
    }

    public componentWillReceiveProps(nextProps: IAttributeElementsProps) {
        if (nextProps.sdk && this.sdk !== nextProps.sdk) {
            this.sdk = nextProps.sdk.clone();
            setTelemetryHeaders(this.sdk, "AttributeElements", nextProps);
        }

        if (
            this.props.uri !== nextProps.uri ||
            this.props.identifier !== nextProps.identifier ||
            this.props.projectId !== nextProps.projectId ||
            !isEqual(this.props.options, nextProps.options)
        ) {
            this.uri = null; // invalidate
            this.setState({
                isLoading: true,
                validElements: null, // invalidate
            });
            this.getValidElements(nextProps, get(nextProps, "options.offset", 0));
        }
    }

    public loadMore(event?: any): void {
        if (event) {
            event.preventDefault();
        }
        // do not execute while still loading
        if (this.state.isLoading) {
            return;
        }
        this.setState({
            isLoading: true,
        });
        const offset = get(this.state, "validElements.paging.offset", 0);
        const count = get(this.state, "validElements.paging.count", 0);
        const nextOffset = offset + count;
        this.getValidElements(this.props, nextOffset);
    }

    public getValidElements(props: IAttributeElementsProps, offset: number): void {
        const { projectId, options, identifier } = props;
        const optionsWithUpdatedPaging = {
            ...options,
            offset,
        };

        const uriPromise = new Promise((resolve, reject) => {
            return props.uri || this.uri
                ? resolve(props.uri || this.uri)
                : this.sdk.md.getUrisFromIdentifiers(projectId, [identifier]).then(
                      result => {
                          this.uri = result[0].uri;
                          resolve(this.uri);
                      },
                      error => {
                          reject(error);
                      },
                  );
        });

        let currentGetValidElementsPromise: Promise<any> = null;
        // The promise needs to reset here because we are not setting it synchroneously
        // and even this small delay is sometimes too late
        this.getValidElementsPromise = null;

        uriPromise
            .then((uri: string) => {
                const objectId = getObjectIdFromUri(uri);
                currentGetValidElementsPromise = this.sdk.md.getValidElements(
                    projectId,
                    objectId, // This is misdocumented as identifier, but is in fact objectId
                    optionsWithUpdatedPaging,
                );
                this.getValidElementsPromise = currentGetValidElementsPromise;
                return this.getValidElementsPromise;
            })
            .then((response: IValidElementsResponse) => {
                if (this.getValidElementsPromise !== currentGetValidElementsPromise) {
                    return Promise.reject(ErrorStates.CANCELLED);
                }
                const items = [
                    ...get(this.state, "validElements.items", []),
                    ...response.validElements.items,
                ];
                const offset = get(
                    this.state,
                    "validElements.paging.offset",
                    parseInt(response.validElements.paging.offset, 10) || 0,
                );
                const mergedResponse = {
                    ...response.validElements,
                    items,
                    paging: {
                        total: parseInt(response.validElements.paging.total, 10),
                        offset,
                        count: items.length,
                    },
                };
                this.setState({
                    validElements: mergedResponse,
                    isLoading: false,
                });
            })
            .catch(error => {
                if (error !== ErrorStates.CANCELLED) {
                    this.setState({
                        error,
                        isLoading: false,
                    });
                }
            });
    }

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
