import * as React from 'react';
import * as gooddata from 'gooddata';

import { VisualizationObject } from '@gooddata/data-layer';

export interface IFetchProps {
    uri: string;
    onData: (data: any) => void;
    onError: (error: any) => void;
    fetcher?: <T>(uri: string) => Promise<T>;
    children?: any;
}

function fetcher(uri: string): Promise<any> {
    return gooddata.xhr.get<VisualizationObject.IVisualizationObjectResponse>(uri);
}

export class Fetch extends React.Component<IFetchProps, null> {
    protected static defaultProps: Partial<IFetchProps> = {
        fetcher
    };

    public render() {
        return this.props.children || null;
    }

    public componentDidMount() {
        this.fetchVisObj(this.props);
    }

    public componentWillReceiveProps(nextProps: IFetchProps) {
        if (this.props.uri !== nextProps.uri) {
            this.fetchVisObj(nextProps);
        }
    }

    private fetchVisObj({ uri }: { uri: string }) {
        const { fetcher, onData, onError } = this.props;

        fetcher(uri)
            .then(onData)
            .catch(onError);
    }
}
