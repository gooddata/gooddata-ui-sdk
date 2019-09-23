// (C) 2019 GoodData Corporation
import React from "react";
import { Col, Container, Row } from "react-grid-system";

import { AreaChart, BarChart, BubbleChart, Executor } from "@gooddata/sdk-ui";

import "./App.css";
import { backend, initialize } from "./backend";
import { workspace, AgentName, AvgDuration, EndpointName, SumOfCalls } from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const App: React.FC = () => {
    return (
        <div className="App">
            <Container>
                <Row>
                    <Col>
                        <Executor
                            execution={backend()
                                .workspace(workspace)
                                .execution()
                                .forItems([EndpointName, AgentName, AvgDuration])}
                        >
                            {({ error, isLoading, fetch, result }) => {
                                const data = result && result.data();
                                let render;
                                if (isLoading) {
                                    render = <div>Loading...</div>;
                                } else if (error) {
                                    render = <div>Error: {error.toString()}</div>;
                                } else if (data) {
                                    render = <div>Data: {data && data.toString()}</div>;
                                }

                                return (
                                    <div>
                                        {render}
                                        <button onClick={fetch} disabled={isLoading}>
                                            Refetch
                                        </button>
                                    </div>
                                );
                            }}
                        </Executor>
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <AreaChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            height={height}
                            measures={[SumOfCalls]}
                            viewBy={AgentName}
                        />
                    </Col>
                    <Col sm={6}>
                        <AreaChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            height={height}
                            measures={[SumOfCalls]}
                            viewBy={AgentName}
                            stackBy={EndpointName}
                            config={{
                                legend: {
                                    enabled: false,
                                },
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <BarChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[SumOfCalls]}
                            viewBy={AgentName}
                            height={height}
                        />
                    </Col>
                    <Col sm={6}>
                        <BarChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[SumOfCalls]}
                            stackBy={AgentName}
                            height={height}
                            config={{
                                legend: {
                                    enabled: false,
                                },
                            }}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <BubbleChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            height={height}
                            xAxisMeasure={AvgDuration}
                            size={SumOfCalls}
                            viewBy={AgentName}
                        />
                    </Col>
                    <Col sm={6}></Col>
                </Row>
            </Container>
        </div>
    );
};

export default App;
