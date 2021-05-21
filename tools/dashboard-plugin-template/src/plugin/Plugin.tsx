// (C) 2019-2021 GoodData Corporation
import React from "react";
import { SomeInsight } from "./SomeInsight";

// Implement your plugin here, you can import other files etc. Just keep the component name and make sure it stays exported.
export const Plugin: React.FC = () => {
    return (
        <div
            style={{
                borderRadius: "4px",
                padding: "2em",
                backgroundColor: "green",
                color: "white",
            }}
        >
            <h2>Plugin</h2>
            <SomeInsight />
        </div>
    );
};
