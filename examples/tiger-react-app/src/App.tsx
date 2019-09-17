// (C) 2019 GoodData Corporation
import { BarChart } from "@gooddata/sdk-ui";
import React from "react";
import { Col, Container, Row } from "react-grid-system";
import "./App.css";
import { backend, initialize } from "./backend";
import { CountryName, ExtendedPriceSum, workspace } from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const App: React.FC = () => {
    return (
        <div className="App">
            <Container>
                <Row>
                    <Col sm={12}>
                        <BarChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[ExtendedPriceSum]}
                            viewBy={CountryName}
                            height={height}
                        />
                    </Col>
                    <Col sm={6}></Col>
                </Row>
            </Container>
        </div>
    );
};

export default App;
