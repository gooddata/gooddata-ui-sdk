// (C) 2019 GoodData Corporation
import React from "react";
import "./App.css";
import { BarChart } from "@gooddata/sdk-ui";
import { backend, initialize } from "./backend";

initialize();
const analyticalBackend = backend();

console.log(analyticalBackend);

const App: React.FC = () => {
    return (
        <div className="App">
            <BarChart
                backend={analyticalBackend}
                workspace="gtl83h4doozbp26q0kf5qg8uiyu4glyn"
                measures={[
                    {
                        measure: {
                            localIdentifier: "blabla",
                            definition: {
                                measureDefinition: {
                                    item: { identifier: "fact.endpoint_calls.calls" },
                                },
                            },
                        },
                    },
                ]}
            />
        </div>
    );
};

export default App;
