// (C) 2025 GoodData Corporation

import React from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

import { Layout } from "./Layout.js";
import { Header } from "../header/Header.js";
import { Main } from "../main/Main.js";
import { PermissionsGate } from "../permission/index.js";
import { Search } from "../search/Search.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

export function Catalog({ backend, workspace }: Props) {
    const intl = useIntl();
    return (
        <Layout>
            <PermissionsGate
                loadingNode={<LoadingMask />}
                errorNode={
                    <ErrorComponent
                        message={intl.formatMessage({ id: "analyticsCatalog.error.unknown.message" })}
                        description={intl.formatMessage({
                            id: "analyticsCatalog.error.unknown.description",
                        })}
                    />
                }
                unauthorizedNode={
                    <ErrorComponent
                        message={intl.formatMessage({ id: "analyticsCatalog.error.unauthorized.message" })}
                        description={intl.formatMessage({
                            id: "analyticsCatalog.error.unauthorized.description",
                        })}
                    />
                }
            >
                <Header searchNode={<Search backend={backend} workspace={workspace} />} />
                <Main workspace={workspace} backend={backend} />
            </PermissionsGate>
        </Layout>
    );
}
