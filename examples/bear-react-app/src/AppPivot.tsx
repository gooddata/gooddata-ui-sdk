// (C) 2019 GoodData Corporation
import { PivotTable } from "@gooddata/sdk-ui";
import React from "react";
import { Col, Container, Row } from "react-grid-system";

import "./App.css";
import { backend, initialize } from "./backend";
import { AgentName, EndpointName, SumOfCalls, workspace } from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const AppPivot: React.FC = () => {
    return (
        <div className="AppPivot">
            <Container>
                <Row>
                    <Col>
                        <PivotTable
                            backend={analyticalBackend}
                            pageSize={30}
                            workspace={workspace}
                            rows={[AgentName, EndpointName]}
                            measures={[SumOfCalls]}
                        />
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AppPivot;
