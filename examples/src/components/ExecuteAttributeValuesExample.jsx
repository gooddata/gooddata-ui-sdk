// (C) 2007-2019 GoodData Corporation
import React, { Component } from "react";
import { Execute, LoadingComponent, ErrorComponent } from "@gooddata/react-components";

import {
    projectId,
    locationStateDisplayFormIdentifier,
    locationNameDisplayFormIdentifier,
} from "../utils/fixtures";

export class ExecuteExample extends Component {
    executeChildrenFunction({ result, isLoading, error }) {
        if (error) {
            return (
                <ErrorComponent
                    message="There was an error getting your execution"
                    description={JSON.stringify(error, null, "  ")}
                />
            );
        }
        if (isLoading) {
            return <LoadingComponent />;
        }
        return (
            <div>
                <ul className="attribute-values s-execute-attribute-values">
                    {
                        result.executionResult.headerItems[0][0].reduce(
                            (buffer, state, stateIndex, states) => {
                                const { elements } = buffer;
                                let { values } = buffer;
                                values.push(
                                    result.executionResult.headerItems[0][1][stateIndex].attributeHeaderItem,
                                );
                                const isLastItem =
                                    stateIndex === states.length - 1 ||
                                    state.attributeHeaderItem.uri !==
                                        states[stateIndex + 1].attributeHeaderItem.uri;
                                if (isLastItem) {
                                    elements.push(
                                        <li key={state.attributeHeaderItem.uri}>
                                            <strong>{state.attributeHeaderItem.name}</strong>
                                            <ul key={state.attributeHeaderItem.uri}>
                                                {values.map(nameValue => (
                                                    <li key={nameValue.uri}>{nameValue.name}</li>
                                                ))}
                                            </ul>
                                        </li>,
                                    );
                                    values = [];
                                }
                                return {
                                    elements,
                                    values,
                                };
                            },
                            { elements: [], values: [] },
                        ).elements
                    }
                </ul>

                <p>Full execution response and result as JSON:</p>
                <div
                    style={{
                        padding: "1rem",
                        backgroundColor: "#EEE",
                    }}
                >
                    <pre
                        style={{
                            maxHeight: 200,
                            overflow: "auto",
                            padding: "1rem",
                        }}
                    >
                        {JSON.stringify({ result, isLoading, error }, null, "  ")}
                    </pre>
                </div>
            </div>
        );
    }

    render() {
        const afm = {
            attributes: [
                {
                    localIdentifier: "state",
                    displayForm: {
                        identifier: locationStateDisplayFormIdentifier,
                    },
                },
                {
                    localIdentifier: "name",
                    displayForm: {
                        identifier: locationNameDisplayFormIdentifier,
                    },
                },
            ],
        };

        return (
            <div>
                <Execute
                    afm={afm}
                    projectId={projectId}
                    onLoadingChanged={this.onLoadingChanged}
                    onError={this.onError}
                >
                    {this.executeChildrenFunction}
                </Execute>
            </div>
        );
    }
}

export default ExecuteExample;
