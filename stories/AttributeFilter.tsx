import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { AttributeFilter } from '../src/components/filters/AttributeFilter/AttributeFilter';

import '../styles/scss/attributeFilter.scss';

const attributeFilterWithUri = {
    uri: '/gdc/md/storybook/obj/3.df',
    isOpenDefault: true,
    projectId: 'storybook',
    onApply: (...args) => console.log('apply', args)
};

const attributeFilterWithIdentifier = {
    identifier: '3.df',
    projectId: 'storybook',
    fullscreenOnMobile: false,
    onApply: (...args) => console.log('apply', args)
};

storiesOf('AttributeFilter', module)
    .add('with uri', () => (
        <div style={{ minHeight: 500 }} >
            <AttributeFilter
                {...attributeFilterWithUri}
            />
            <span style={{ display: 'inline-block', width: 208 }}></span>
            <AttributeFilter
                {...attributeFilterWithIdentifier}
            />
        </div>
    ));
