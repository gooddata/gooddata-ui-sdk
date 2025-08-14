// (C) 2025 GoodData Corporation

import React from "react";
import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { Layout } from "./Layout.js";
import { Main } from "../main/Main.js";
import { Header } from "../header/Header.js";

type Props = {
    backend?: IAnalyticalBackend;
    workspace?: string;
};

export function Catalog({ backend, workspace }: Props) {
    return (
        <Layout>
            <Header />
            <Main workspace={workspace} backend={backend} />
        </Layout>
    );
}
