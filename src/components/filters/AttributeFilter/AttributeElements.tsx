// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import * as PropTypes from 'prop-types';
import * as GoodData from 'gooddata';
import { AFM } from '@gooddata/typings';
import { get } from 'lodash';
import { getObjectIdFromUri } from '../../../helpers/utils';

export interface IPaging {
    count: number;
    offset: number;
    total: number;
}

export interface IAttributeElementsProps {
    metadata?: typeof GoodData.md;
    projectId: string;
    uri?: string;
    identifier?: string;
    options?: GoodData.IValidElementsOptions;

    children?(props: IAttributeElementsChildren): any;
}

export interface IValidElements {
    items: GoodData.IElement[];
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
    loadMore: Function;
    isLoading: boolean;
    error: any;
}

export class AttributeElements extends React.PureComponent<IAttributeElementsProps, IAttributeElementsState> {

    public static propTypes = {
        projectId: PropTypes.string.isRequired,
        uri: PropTypes.string,
        identifier: PropTypes.string,
        options: PropTypes.object,
        metadata: PropTypes.shape({
            getObjectDetails: PropTypes.func.isRequired,
            getObjectUri: PropTypes.func.isRequired
        })
    };

    public static defaultProps: Partial<IAttributeElementsProps> = {
        metadata: GoodData.md,
        projectId: null,
        uri: null,
        identifier: null,
        options: null,
        children: ({
            validElements,
            loadMore,
            isLoading,
            error
        }) => {
            const paging: Partial<IPaging> = validElements ? validElements.paging : {};
            const {
                offset = 0,
                count = null,
                total = null
            } = paging;
            const nextOffset = count + offset;
            if (error) {
                return <div>{error}</div>;
            }
            return (
                <div>
                    <p>
                        Use children function to map {'{'} validElements, loadMore, isLoading {'} '}
                        to your React components.
                    </p>
                    <button
                        className="button button-secondary"
                        onClick={loadMore as any}
                        disabled={isLoading || (offset + count === total)}
                    >More
                    </button>
                    <h2>validElements</h2>
                    <pre>
                        isLoading: {isLoading.toString()}
                        offset: {offset}
                        count: {count}
                        total: {total}
                        nextOffset: {nextOffset}
                        validElements:
                        {JSON.stringify(validElements, null, '\t')}
                    </pre>
                </div>
            );
        }
    };

    private uri?: string = null;

    constructor(props: IAttributeElementsProps) {
        super(props);

        this.state = {
            validElements: null,
            isLoading: true,
            error: null
        };

        this.loadMore = this.loadMore.bind(this);
    }

    public componentDidMount() {
        this.getValidElements(this.props, get(this.props, 'options.offset', 0));
    }

    public componentWillReceiveProps(nextProps: IAttributeElementsProps) {
        if (this.props.uri !== nextProps.uri ||
            this.props.identifier !== nextProps.identifier ||
            this.props.projectId !== nextProps.projectId ||
            get(this.props, 'options.offset') !== get(nextProps, 'options.offset')
        ) {
            this.uri = null; // invalidate
            this.setState({
                isLoading: true,
                validElements: null // invalidate
            });
            this.getValidElements(nextProps, get(nextProps, 'options.offset', 0));
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
            isLoading: true
        });
        const offset = get(this.state, 'validElements.paging.offset', 0);
        const count = get(this.state, 'validElements.paging.count', 0);
        const nextOffset = offset + count;
        this.getValidElements(this.props, nextOffset);
    }

    public getValidElements(props: IAttributeElementsProps, offset: number) { // IAttributeElementsProps
        const { projectId, options, identifier } = props;
        const optionsWithUpdatedPaging = {
            ...options,
            offset
        };

        const uriPromise = new Promise((resolve, reject) => {
            return (props.uri || this.uri)
                ? resolve(props.uri || this.uri)
                : props.metadata.getUrisFromIdentifiers(projectId, [identifier])
                    .then(
                        (result) => {
                            this.uri = result[0].uri;
                            resolve(this.uri);
                        },
                        (error) => {
                            reject(error);
                        }
                    );
        });

        uriPromise
            .then((uri: string) => {
                const objectId = getObjectIdFromUri(uri);
                return props.metadata.getValidElements(
                    projectId,
                    objectId, // This is misdocumented as identifier, but is in fact objectId
                    optionsWithUpdatedPaging
                );
            })
            .then((response: GoodData.IValidElementsResponse) => {
                const items = [
                    ...get(this.state, 'validElements.items', []),
                    ...response.validElements.items
                ];
                const offset = get(
                    this.state,
                    'validElements.paging.offset',
                    parseInt(response.validElements.paging.offset, 10) || 0
                );
                const mergedResponse = {
                    ...response.validElements,
                    items,
                    paging: {
                        total: parseInt(response.validElements.paging.total, 10),
                        offset,
                        count: items.length
                    }
                };
                this.setState({
                    validElements: mergedResponse,
                    isLoading: false
                });
            })
            .catch(error => (
                this.setState({
                    error,
                    isLoading: false
                })
            ));
    }

    public render() {
        const { validElements, isLoading, error } = this.state;
        return this.props.children({
            validElements,
            loadMore: this.loadMore,
            isLoading,
            error
        });
    }
}
