// (C) 2019 GoodData Corporation
import { BarChart, PieChart } from "@gooddata/sdk-ui";
import React from "react";
import { Col, Container, Row } from "react-grid-system";
import "./App.css";
import { backend, initialize } from "./backend";
import {
    BrandName,
    CountryName,
    ExtendedPriceSum,
    FilteredExtendedPriceSum,
    QuantitySum,
    workspace,
} from "./model";

initialize();
const analyticalBackend = backend();
const height = 400;

const App: React.FC = () => {
    return (
        <div className="App">
            <Container>
                <Row>
                    <Col sm={6}>
                        <BarChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[ExtendedPriceSum]}
                            viewBy={BrandName}
                            height={height}
                        />
                    </Col>
                    <Col sm={6}>
                        <BarChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[QuantitySum]}
                            viewBy={CountryName}
                            height={height}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col sm={6}>
                        <PieChart
                            backend={analyticalBackend}
                            workspace={workspace}
                            measures={[FilteredExtendedPriceSum]}
                            viewBy={BrandName}
                        />
                    </Col>
                    <Col sm={6}></Col>
                </Row>
            </Container>
        </div>
    );
};

export default App;
