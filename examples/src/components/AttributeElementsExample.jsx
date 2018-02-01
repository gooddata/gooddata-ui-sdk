import React, { Component } from 'react';
import { AttributeElements } from '@gooddata/react-components';
import PropTypes from 'prop-types';

import '@gooddata/react-components/styles/css/main.css';

import { employeeNameIdentifier, projectId } from '../utils/fixtures';

export class AttributeFilterItem extends Component {
    static propTypes = {
        title: PropTypes.string.isRequired,
        uri: PropTypes.string.isRequired
    }

    onChange(uri) {
        // eslint-disable-next-line no-console
        return event => console.log('AttributeFilterItem onChange', uri, event.target.value === 'on');
    }

    render() {
        const { title, uri } = this.props;
        return (<label className="gd-list-item s-attribute-filter-list-item" style={{ display: 'inline-block' }} >
            <input type="checkbox" className="gd-input-checkbox" onChange={this.onChange(uri)} />
            <span>{title}</span>
        </label>);
    }
}

export class AttributeElementsExample extends Component {
    render() {
        const attributeElementsProps = {
            identifier: employeeNameIdentifier,
            projectId,
            options: {
                limit: 20
            },
            children: ({
                validElements,
                loadMore,
                isLoading,
                error
            }) => {
                const {
                    offset = null,
                    count = null,
                    total = null
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
                            className="button button-secondary"
                            onClick={loadMore}
                            disabled={isLoading || (offset + count === total)}
                        >More</button>
                        <h2>validElements</h2>
                        <pre>
                            isLoading: {isLoading.toString()}<br />
                            offset: {offset}<br />
                            count: {count}<br />
                            total: {total}<br />
                            nextOffset: {offset + count}
                        </pre>
                        <div>
                            {validElements ? validElements.items.map(item => (
                                <AttributeFilterItem
                                    key={item.element.uri}
                                    uri={item.element.uri}
                                    title={item.element.title}
                                />
                            )) : null}
                        </div>
                        {validElements ? <pre>{JSON.stringify(validElements, null, '  ')}</pre> : null}
                    </div>
                );
            }
        };

        return (<div style={{ minHeight: 500 }}>
            <div className="gd-message error" style={{ display: 'block' }}>
                <div className="gd-message-text"><strong>AttributeElements are currently out of order :-(</strong>
                    <div>There is an outstanding bug reported for this: <a href="https://jira.intgdc.com/browse/RAIL-619" >RAIL-619</a></div>
                </div>
            </div>
            <AttributeElements
                {...attributeElementsProps}
            />
        </div>);
    }
}

export default AttributeElementsExample;
