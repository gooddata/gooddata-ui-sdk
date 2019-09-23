// (C) 2007-2018 GoodData Corporation
import * as React from "react";
import * as PropTypes from "prop-types";
import { IAttributeDisplayForm } from "./model";

export interface IAttributeLoaderMetadataProps {
    getObjectUri: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
    getObjectDetails: (...params: any[]) => any; // TODO: make the types more specific (FET-282)
}

export interface IAttributeLoaderProps {
    metadata: IAttributeLoaderMetadataProps;
    projectId: string;
    uri?: string;
    identifier?: string;

    children(props: IAttributeLoaderChildren): any;
}

export interface IAttributeLoaderState {
    attributeDisplayForm: IAttributeDisplayForm;
    isLoading: boolean;
    isUsingIdentifier: boolean;
    error?: any;
}

export interface IAttributeLoaderChildren {
    attributeDisplayForm: IAttributeDisplayForm;
    isLoading: boolean;
    isUsingIdentifier: boolean;
}

function getAttributeUri(
    metadata: IAttributeLoaderMetadataProps,
    projectId: string,
    uri: string,
    identifier: string,
): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        if (uri) {
            return resolve(uri);
        }
        if (!identifier || !projectId) {
            return reject(
                new Error("Missing either uri, or identifier and projectId in AttributeFilter props"),
            );
        }
        return metadata.getObjectUri(projectId, identifier).then((uri: string) => {
            resolve(uri);
        }, reject);
    });
}

function getAttributeDisplayForm(
    metadata: IAttributeLoaderMetadataProps,
    uri: string,
): Promise<IAttributeDisplayForm> {
    return metadata.getObjectDetails(uri).then((result: any) => {
        if (!result || !result.attributeDisplayForm) {
            throw new Error('Invalid data uri. Required data uri must be of type "attributeDisplayForm"');
        }
        return result.attributeDisplayForm;
    });
}

export class AttributeLoader extends React.PureComponent<IAttributeLoaderProps, IAttributeLoaderState> {
    public static propTypes = {
        projectId: PropTypes.string.isRequired,
        uri: PropTypes.string,
        identifier: PropTypes.string,
        metadata: PropTypes.shape({
            getObjectDetails: PropTypes.func.isRequired,
            getObjectUri: PropTypes.func.isRequired,
        }).isRequired,
    };

    public static defaultProps: Partial<IAttributeLoaderProps> = {
        uri: null,
        identifier: null,
    };

    constructor(props: IAttributeLoaderProps) {
        super(props);

        this.state = {
            attributeDisplayForm: null,
            isLoading: true,
            isUsingIdentifier: false,
            error: null,
        };
    }

    public componentDidMount() {
        this.getAttributeDisplayForm(this.props);
    }

    public componentWillReceiveProps(nextProps: IAttributeLoaderProps) {
        if (
            this.props.uri !== nextProps.uri ||
            this.props.identifier !== nextProps.identifier ||
            this.props.projectId !== nextProps.projectId
        ) {
            this.setState({
                isLoading: true,
                attributeDisplayForm: null, // invalidate
            });
            this.getAttributeDisplayForm(nextProps);
        }
    }

    public render() {
        const { attributeDisplayForm, isLoading, isUsingIdentifier } = this.state;
        return this.props.children({
            attributeDisplayForm,
            isLoading,
            isUsingIdentifier,
        });
    }

    private getAttributeDisplayForm(props: IAttributeLoaderProps) {
        const { metadata, projectId, uri, identifier } = props;
        getAttributeUri(metadata, projectId, uri, identifier)
            .then((dfUri: string) => getAttributeDisplayForm(metadata, dfUri))
            .then(
                (attributeDisplayForm: IAttributeDisplayForm) => {
                    this.setState({
                        attributeDisplayForm,
                        isLoading: false,
                        isUsingIdentifier: !!identifier,
                        error: null,
                    });
                },
                (error: any) => {
                    this.setState({
                        attributeDisplayForm: null,
                        isLoading: false,
                        error,
                    });
                },
            );
    }
}
