// (C) 2019-2021 GoodData Corporation
import React from "react";
import { InsightView } from "@gooddata/sdk-ui-ext";

export const SomeInsight: React.FC = () => {
    return (
        <div style={{ height: 400 }}>
            <InsightView insight="aaKaMZUJeyGo" showTitle="Other title" />
        </div>
    );
};
