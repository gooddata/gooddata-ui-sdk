import React, { Component } from 'react';
import { AttributeFilter } from '@gooddata/react-components';

import '@gooddata/react-components/styles/css/main.css';

import { employeeNameIdentifier, projectId } from '../utils/fixtures';

export class AttributeFilterExample extends Component {
    onApply(params) {
        // eslint-disable-next-line no-console
        console.log('AttributeFilterExample onApply', ...params);
    }

    render() {
        return (<div>
            <AttributeFilter
                identifier={employeeNameIdentifier}
                projectId={projectId}
                fullscreenOnMobile={false}
                onApply={this.onApply}
            />
        </div>);
    }
}

export default AttributeFilterExample;
