import * as React from 'react';
import { injectIntl } from 'react-intl';
import includes = require('lodash/includes');
import get = require('lodash/get');
import isEmpty = require('lodash/isEmpty');
import isString = require('lodash/isString');
import merge = require('lodash/merge');
import { ExecutorResult } from '@gooddata/data-layer';

export interface ITranslationsProviderProps {
    result: ExecutorResult.ISimpleExecutorResult;
    intl;
}

function replaceEmptyAttributeValues(data: ExecutorResult.ISimpleExecutorResult, emptyValueString = '') {
    const headers = get(data, 'headers', null);
    const rawData = get(data, 'rawData', null);
    if (!headers || !rawData) {
        return data;
    }

    const attributeIndexes = headers.reduce((arr, header) => {
        if (header.type === 'attrLabel') {
            arr.push(data.headers.indexOf(header));
        }

        return arr;
    }, []);

    const sanitizedData = merge({}, data);

    sanitizedData.rawData = rawData.map((row) => {
        return row.map((value, index) => {
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

export class TranslationsProvider extends React.Component<ITranslationsProviderProps, null> {
    public render() {
        if (!this.props.result) {
            return null;
        }
        return (
            <span>
                {React.cloneElement(this.props.children as any, {
                    data: replaceEmptyAttributeValues(this.props.result, this.getEmptyValueString()),
                    numericSymbols: this.getNumericSymbols()
                })}
            </span>
        );
    }

    private formatMessage(id: string, ...args) {
        return this.props.intl.formatMessage({ id }, ...args);
    }

    private getNumericSymbols() {
        return [
            `${this.formatMessage('visualization.numericValues.k')}`,
            `${this.formatMessage('visualization.numericValues.m')}`,
            `${this.formatMessage('visualization.numericValues.g')}`,
            `${this.formatMessage('visualization.numericValues.t')}`,
            `${this.formatMessage('visualization.numericValues.p')}`,
            `${this.formatMessage('visualization.numericValues.e')}`
        ];
    }

    private getEmptyValueString() {
        return `(${this.formatMessage('visualization.emptyValue')})`;
    }
}

export const IntlTranslationsProvider = injectIntl(TranslationsProvider);
