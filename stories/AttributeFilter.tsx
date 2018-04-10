// (C) 2007-2018 GoodData Corporation
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

import { AttributeFilter } from '../src/components/filters/AttributeFilter/AttributeFilter';
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

storiesOf('Helper components/AttributeFilter', module)
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
