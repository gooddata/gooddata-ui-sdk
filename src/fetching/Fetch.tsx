import * as React from 'react';
import * as gooddata from 'gooddata';
import compact = require('lodash/compact');

import { VisualizationObject } from '@gooddata/data-layer';

import { getProjectIdByUri } from '../helpers/project';
import { IAttribute } from '@gooddata/data-layer/dist/afmMap/model/gooddata/Attribute';

export interface IFetchProps {
    uri: string;
    onData: (data: any) => void;
    onError: (error: any) => void;
    fetcher?: <T>(uri: string) => Promise<T>;
    children?: any;
}

function extractDateAttributes(visObj: VisualizationObject.IVisualizationObjectContent): string[] {
    const attributes = visObj.buckets.filters.map((filter) => {
        if ((filter as VisualizationObject.IEmbeddedDateFilter).dateFilter) {
            return (filter as VisualizationObject.IEmbeddedDateFilter).dateFilter.attribute;
        }
        return null;
    });

    return compact(attributes);
}

function fetcher(uri: string): Promise<any> {
    return gooddata.xhr.get<VisualizationObject.IVisualizationObjectResponse>(uri).then((visualization) => {
        const attributes = extractDateAttributes(visualization.visualization.content);

        if (!attributes.length) {
            return { attributesMap: {}, visObj: visualization };
        }

        return gooddata.md.getObjects(getProjectIdByUri(uri), attributes)
            .then((items: IAttribute[]) => {
                const attributesMap = items.reduce((map: IAttribute[], item: IAttribute) => ({
                    ...map,
                    [item.attribute.meta.uri]: item.attribute.content.displayForms[0].meta.uri
                }), {});

                return { attributesMap, visObj: visualization };
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
