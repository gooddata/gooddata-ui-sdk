import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { AttributeFilter } from '../src/components/filters/AttributeFilter/AttributeFilter';
import {
    AttributeElements,
    IAttributeElementsProps
} from '../src/components/filters/AttributeFilter/AttributeElements';
import { AttributeFilterItem } from '../src/components/filters/AttributeFilter/AttributeFilterItem';
import '../styles/scss/attributeFilter.scss';

const attributeFilterWithUri = {
    uri: '/gdc/md/storybook/obj/3.df',
    isOpenDefault: true,
    projectId: 'storybook',
    onApply: action('apply')
};

const attributeFilterWithIdentifier = {
    identifier: '3.df',
    projectId: 'storybook',
    fullscreenOnMobile: false,
    onApply: action('apply')
};

storiesOf('AttributeFilter', module)
    .add('with uri', () => (
        <div style={{ minHeight: 500 }}>
            <AttributeFilter
                {...attributeFilterWithUri}
            />
            <span style={{ display: 'inline-block', width: 208 }} />
            <AttributeFilter
                {...attributeFilterWithIdentifier}
            />
        </div>
    ));

const attributeElementsProps: IAttributeElementsProps = {
    // identifier: '3.df',
    uri: '/gdc/md/storybook/obj/3.df',
    projectId: 'storybook',
    options: {
        limit: 20
    },
    children: ({
        validElements,
        loadMore,
        isLoading,
        error
    }: any) => {
        const {
            offset = null as any,
            count = null as any,
            total = null as any
        } = validElements ? validElements.paging : {};
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
                    onClick={loadMore as any}
                    disabled={isLoading || (offset + count === total)}
                >More
                </button>
                <h2>validElements</h2>
                <p>
                    isLoading: {isLoading.toString()}<br />
                    offset: {offset}<br />
                    count: {count}<br />
                    total: {total}<br />
                    nextOffset: {offset + count}
                </p>
                <div>
                    {validElements ? validElements.items.map((item: any) => (
                        <span key={item.element.uri} style={{float: 'left'}}><AttributeFilterItem
                            item={{
                                selected: false,
                                onSelect: action('select'),
                                source: {
                                    uri: item.element.uri,
                                    title: item.element.title,
                                    empty: false
                                }
                            }}
                        /></span>
                    )) : null}
                </div>
            </div>
        );
    }
};

storiesOf('AttributeElements', module)
    .add('with uri', () => (
        <div style={{ minHeight: 500 }}>
            <AttributeElements
                {...attributeElementsProps}
            />
        </div>
    ));
