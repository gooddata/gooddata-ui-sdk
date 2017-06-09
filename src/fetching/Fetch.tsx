import * as React from 'react';
import { xhr, md } from 'gooddata';
import compact = require('lodash/compact');

import { IVisualizationObject, IEmbeddedDateFilter } from '@gooddata/data-layer/dist/legacy/model/VisualizationObject';
import { getProjectIdByUri } from '../helpers/project';

export interface IFetchProps {
    uri: string;
    onData: (data: any) => void;
    onError: (error: any) => void;
    fetcher?: <T>(uri: string) => Promise<T>;
    children?: any;
}

function extractDateAttributes(visObj: IVisualizationObject): string[] {
    const attributes = visObj.buckets.filters.map((filter) => {
        if ((filter as IEmbeddedDateFilter).dateFilter) {
            return (filter as IEmbeddedDateFilter).dateFilter.attribute;
        }
        return null;
    });

    return compact(attributes);
}

function fetcher(uri: string): Promise<any> {
    return xhr.get(uri).then((visObj) => {
        const attributes = extractDateAttributes(visObj.visualization.content);

        if (!attributes.length) {
            return { attributesMap: {}, visObj };
        }

        return md.getObjects(getProjectIdByUri(uri), attributes).then((items) => {
            const attributesMap = items.reduce((map, item) => ({
                ...map,
                [item.attribute.meta.uri]: item.attribute.content.displayForms[0].meta.uri
            }), {});

            return { attributesMap, visObj };
        });
    });
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

    public componentWillReceiveProps(nextProps) {
        if (this.props.uri !== nextProps.uri) {
            this.fetchVisObj(nextProps);
        }
    }

    private fetchVisObj({ uri }) {
        const { fetcher, onData, onError } = this.props;

        fetcher(uri)
            .then(onData)
            .catch(onError);
    }
}
