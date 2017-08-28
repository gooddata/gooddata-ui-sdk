import * as React from 'react';
import * as sdk from 'gooddata';
import { IAttributeDisplayForm } from './model';

const { PropTypes } = React;

export interface IAttributeLoaderProps {
    children(props): any;
    metadata?: {
        getObjectUri: Function;
        getObjectDetails: Function;
    };
    projectId: string;
    uri?: string;
    identifier?: string;
}

export interface IAttributeLoaderState {
    attributeDisplayForm: IAttributeDisplayForm;
    isLoading: boolean;
    isUsingIdentifier: boolean;
    error?: any;
}

function getAttributeUri(metadata, projectId: string, uri: string, identifier: string): Promise<string> {
    const uriPromise = new Promise<string>((resolve, reject) => {
        if (uri) {
            return resolve(uri);
        }
        if (!identifier || !projectId) {
            return reject(new Error('Missing either uri, or identifier and projectId in AttributeFilter props'));
        }
        return metadata.getObjectUri(projectId, identifier).then((uri) => {
            resolve(uri);
        }, reject);
    });
    
    return uriPromise;
}

function getAttributeDisplayForm(metadata, uri): Promise<IAttributeDisplayForm> {
    return metadata.getObjectDetails(uri).then((result) => {
        if (!result || !result.attributeDisplayForm) {
            throw new Error('Invalid data uri. Required data uri must be of type "attributeDisplayForm"');
        }
        return result.attributeDisplayForm;
    });
}

export class AttributeLoader extends React.PureComponent<IAttributeLoaderProps, IAttributeLoaderState> {
    static propTypes = {
        projectId: PropTypes.string.isRequired,
        uri: PropTypes.string,
        identifier: PropTypes.string,
        metadata: PropTypes.shape({
            getObjectDetails: PropTypes.func.isRequired,
            getObjectUri: PropTypes.func.isRequired
        })
    };

    static defaultProps = {
        uri: null,
        identifier: null,
        metadata: sdk.md
    };

    constructor(props) {
        super(props);

        this.state = {
            attributeDisplayForm: null,
            isLoading: true,
            isUsingIdentifier: false,
            error: null
        };
    }

    componentDidMount() {
        this.getAttributeDisplayForm(this.props);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.uri !== nextProps.uri ||
            this.props.identifier !== nextProps.identifier ||
            this.props.projectId !== nextProps.projectId
        ) {
            this.setState({
                isLoading: true,
                attributeDisplayForm: null // invalidate
            });
            this.getAttributeDisplayForm(nextProps);
        }
    }

    getAttributeDisplayForm(props) {
        const { metadata, projectId, uri, identifier } = props;
        getAttributeUri(metadata, projectId, uri, identifier)
            .then(dfUri => getAttributeDisplayForm(metadata, dfUri))
            .then(
                (attributeDisplayForm) => {
                    this.setState({
                        attributeDisplayForm,
                        isLoading: false,
                        isUsingIdentifier: !!identifier,
                        error: null
                    });
                },
                (error) => {
                    this.setState({
                        attributeDisplayForm: null,
                        isLoading: false,
                        error
                    });
                }
            );
    }
   
    render() {
        const { attributeDisplayForm, isLoading, isUsingIdentifier } = this.state;
        return this.props.children({
            attributeDisplayForm,
            isLoading,
            isUsingIdentifier
        });
    }
}
