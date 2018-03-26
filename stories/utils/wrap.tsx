// (C) 2007-2018 GoodData Corporation
import * as React from 'react';

import IntlWrapper from './IntlWrapper';

export function wrap(
    component: any,
    height: number = 600,
    width: number = 600,
    minHeight?: number,
    minWidth?: number,
    key?: any
) {
    const keyProp = key ? { key } : {};
    return (
        <IntlWrapper {...keyProp}>
            <div style={{ height, width, minHeight, minWidth, border: '1px solid pink', margin: 10 }}>
                {component}
            </div>
        </IntlWrapper>
    );
}
