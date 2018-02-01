
import React, { Component } from 'react';
import { Execute } from '@gooddata/react-components';

import { totalSalesIdentifier, projectId } from '../utils/fixtures';

export class ExecuteExample extends Component {
    constructor(props) {
        super(props);

        // We need to track error and isLoading states, executionNumber to force remount of execution component
        this.state = {
            error: null,
            isLoading: true,
            executionNumber: 0,
            willFail: true
        };
        this.onLoadingChanged = this.onLoadingChanged.bind(this);
        this.onError = this.onError.bind(this);
        this.retry = this.retry.bind(this);
    }

    onLoadingChanged({ isLoading }) {
        // eslint-disable-next-line no-console
        console.log('isLoading', isLoading);
        // onLoadingChanged must reset error, so that we are not in error during loading
        // onError is run after onLoadingChanged, so we do not have to worry about overriding current error
        this.setState({
            isLoading,
            error: null
        });
    }

    onError(error) {
        // eslint-disable-next-line no-console
        console.log('onError', error);
        this.setState({
            error
        });
    }

    retry() {
        // eslint-disable-next-line no-console
        console.log('retry');
        // We need to track executionNumber so that we can remount Execute component
        // In order to showcase error states, here we also decide if the next execution will fail or not
        this.setState({
            executionNumber: this.state.executionNumber + 1,
            willFail: this.state.executionNumber % 2
        });
    }

    render() {
        const { error, isLoading, executionNumber, willFail } = this.state;
        const afm = {
            measures: [
                {
                    localIdentifier: 'measure',
                    definition: {
                        measure: {
                            item: {
                                // In order to showcase the fail state, we send invalid measure uri
                                identifier: willFail ? totalSalesIdentifier : null
                            }
                        }
                    }
                }
            ]
        };

        let status = null;

        // This is how we render loading and error states
        if (isLoading) {
            status = <div className="gd-message progress"><div className="gd-message-text">Loading…</div></div>;
        } else if (error) {
            status = <div className="gd-message error"><div className="gd-message-text">Oops, simulated error! Retry?</div></div>;
        }

        return (<div>
            {status}
            <p><button onClick={this.retry} className="button button-secondary" >Retry</button> (fails every second attempt)</p>
            {/* We need to render the Execute component even during loading otherwise the ongoing request is cancelled */}
            <Execute
                key={executionNumber}
                afm={afm}
                projectId={projectId}
                onLoadingChanged={this.onLoadingChanged}
                onError={this.onError}
            >{(executionResult) => {
                    return error ? <div /> : (<blockquote>
                        <style jsx>{`
                            .kpi {
                                height: 60px;
                                margin: 10px 0;
                                font-size: 50px;
                                line-height: 60px;
                                white-space: nowrap;
                                vertical-align: bottom;
                                font-weight: 700;
                            }
                        `}</style>
                        <p className="kpi">{executionResult.result.executionResult.executionResult.data[0]}</p>
                        <p>Full execution response and result as JSON:</p>
                        <pre>{JSON.stringify(executionResult, null, '  ')}</pre>
                    </blockquote>);
                }}</Execute>
        </div>);
    }
}

export default ExecuteExample;
