// (C) 2019 GoodData Corporation
import React from "react";
import { Col, Container, Row } from "react-grid-system";

import {
    AreaChart,
    BarChart,
    BubbleChart,
    DonutChart,
    Executor,
    Kpi,
    PieChart,
    Visualization,
} from "@gooddata/sdk-ui";

import "./App.css";
import { backend, initialize } from "./backend";
import { AgentName, AvgDuration, EndpointName, SumOfCalls, workspace } from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const App: React.FC = () => {
    return (
        <div className="App">
            <Container>
                <Row>
                    <Col>
                        <Visualization
                            backend={analyticalBackend}
                            id="abgkddfHcFon"
                            workspace={workspace}
                            filters={[
                                {
                                    relativeDateFilter: {
                                        dataSet: {
                                            uri: "/gdc/md/gtl83h4doozbp26q0kf5qg8uiyu4glyn/obj/344",
                                        },
                                        from: -10,
                                        to: 0,
                                        granularity: "GDC.time.month",
                                    },
                                },
                            ]}
                        />
                    </Col>
                </Row>
                {/*
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
                    <Col>
                        <Kpi backend={analyticalBackend} workspace={workspace} measure={AvgDuration} />
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
                            config={{
                                legend: {
                                    enabled: false,
                                },
                            }}
                        />
                    </Col>
                    <Col sm={6}></Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <PieChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[SumOfCalls]}
                            viewBy={AgentName}
                            height={height}
                            config={{
                                colorPalette: [
                                    {
                                        guid: "1",
                                        fill: {
                                            r: 100,
                                            g: 100,
                                            b: 100,
                                        },
                                    },
                                ],
                                legend: {
                                    enabled: false,
                                },
                            }}
                        />
                    </Col>
                    <Col sm={6}>
                        <DonutChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[SumOfCalls]}
                            viewBy={AgentName}
                            height={height}
                            config={{
                                legend: {
                                    enabled: false,
                                },
                            }}
                        />
                    </Col>
                </Row>
                 */}
            </Container>
        </div>
    );
};

export default App;
