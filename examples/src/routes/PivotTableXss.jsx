// (C) 2007-2019 GoodData Corporation
import React from "react";
import { PivotTableXssExample } from "../components/PivotTableXssExample";

export const PivotTableXss = () => (
    <div>
        <h1>Pivot Table XSS tests</h1>

        <PivotTableXssExample className="s-xss-in-measures" />
    </div>
);

export default PivotTableXss;
