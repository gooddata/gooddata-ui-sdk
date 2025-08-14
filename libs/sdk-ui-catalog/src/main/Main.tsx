// (C) 2025 GoodData Corporation

import React from "react";
import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

type Props = {
    backend?: IAnalyticalBackend;
    workspace?: string;
};

export function Main({ workspace }: Props) {
    return <section className="gd-analytics-catalog-main">workspace: {workspace}</section>;
}
