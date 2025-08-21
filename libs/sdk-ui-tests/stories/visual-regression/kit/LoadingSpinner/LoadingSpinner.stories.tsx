// (C) 2021-2025 GoodData Corporation
import { LoadingSpinner } from "@gooddata/sdk-ui-kit";
import React from "react";

import "@gooddata/sdk-ui-kit/styles/css/main.css";
import "./styles.scss";

const LoadingSpinnerTest = () => {
    return (
        <div className="library-component screenshot-target">
            <div className="loading-spinner-wrapper">
                Small
                <LoadingSpinner color="#00f" className="small" />
            </div>
            <br />
            <div className="loading-spinner-wrapper">
                Large
                <LoadingSpinner color="#f00" className="large" />
            </div>
        </div>
    );
};

export default {
    title: "12 UI Kit/LoadingSpinner",
};

export const FullFeatured = () => <LoadingSpinnerTest />;
FullFeatured.parameters = { kind: "full-featured", screenshot: true };
