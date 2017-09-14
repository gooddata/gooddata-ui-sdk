import * as React from 'react';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import includes = require('lodash/includes');
import get = require('lodash/get');
import isEmpty = require('lodash/isEmpty');
import isString = require('lodash/isString');
import merge = require('lodash/merge');
import { IAttributeValue, ISimpleExecutorResult } from 'gooddata';

import { Header } from '@gooddata/data-layer';

export interface ITranslationsProviderProps {
    result: ISimpleExecutorResult;
    children: any;
}

export interface ITranslationsComponentProps {
    data: ISimpleExecutorResult;
    numericSymbols: string[];
}

function replaceEmptyAttributeValues(data: ISimpleExecutorResult, emptyValueString = '') {
    const headers = get(data, 'headers', null);
    const rawData = get(data, 'rawData', null);

    if (!headers || !rawData) {
        return data;
    }

    const attributeIndexes = headers
        .reduce(
            (arr: number[], header: Header.Header) => {
                if (header.type === 'attrLabel') {
                    arr.push(data.headers.indexOf(header));
                }

                return arr;
            },
            []
        );

    const sanitizedData = merge({}, data);

    sanitizedData.rawData = rawData.map((row: IAttributeValue[]) => {
        return row.map((value: IAttributeValue, index: number) => {
            if (includes(attributeIndexes, index)) {

                if (isString(value.name) && isEmpty(value.name)) {
                    return {
                        ...value,
                        name: emptyValueString
                    };
                }
            }
            return value;
        });
    });

    return sanitizedData;
}

export class TranslationsProvider extends React.Component<ITranslationsProviderProps & InjectedIntlProps, null> {
    public render() {
        if (!this.props.result) {
            return null;
        }

        return React.cloneElement(this.props.children as any, {
            data: replaceEmptyAttributeValues(this.props.result, this.getEmptyValueString()),
            numericSymbols: this.getNumericSymbols()
        });
    }

    private getNumericSymbols() {
        return [
            'visualization.numericValues.k',
            'visualization.numericValues.m',
            'visualization.numericValues.g',
            'visualization.numericValues.t',
            'visualization.numericValues.p',
            'visualization.numericValues.e'
        ].map((id: string) => this.props.intl.formatMessage({ id }));
    }

    private getEmptyValueString() {
        const emptyValueString = this.props.intl.formatMessage({ id: 'visualization.emptyValue' });
        return `(${emptyValueString})`;
    }
}

export const IntlTranslationsProvider = injectIntl(TranslationsProvider);
