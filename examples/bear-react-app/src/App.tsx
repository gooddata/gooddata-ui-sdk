// (C) 2019 GoodData Corporation
import React from "react";
import "./App.css";
import { AreaChart, BarChart, BubbleChart } from "@gooddata/sdk-ui";
import { backend, initialize } from "./backend";
import { Col, Container, Row } from "react-grid-system";
import { AgentName, AvgDuration, EndpointName, SumOfCalls, workspace } from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const App: React.FC = () => {
    return (
        <div className="App">
            <Container>
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
