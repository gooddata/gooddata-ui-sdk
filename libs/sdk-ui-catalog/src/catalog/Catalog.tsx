// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

import { Layout } from "./Layout.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import type { ICatalogItemRef } from "../catalogItem/index.js";
import { Header } from "../header/Header.js";
import { Main } from "../main/Main.js";
import { PermissionsGate, useFeatureFlag } from "../permission/index.js";
import { QualityScoreCard } from "../quality/QualityScoreCard.js";
import { FullTextSearchInput } from "../search/index.js";

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
    openCatalogItemRef?: ICatalogItemRef;
    onCatalogItemOpenClick?: (e: MouseEvent, linkClickEvent: OpenHandlerEvent) => void;
    onCatalogItemNavigation?: (event: MouseEvent, target: ICatalogItemRef) => void;
    onCatalogDetailOpened?: (ref: ICatalogItemRef) => void;
    onCatalogDetailClosed?: () => void;
};

export function Catalog({
    openCatalogItemRef,
    backend,
    workspace,
    onCatalogItemOpenClick,
    onCatalogItemNavigation,
    onCatalogDetailOpened,
    onCatalogDetailClosed,
}: Props) {
    const intl = useIntl();

    const isQualityEnabled = useFeatureFlag("enableGenAICatalogQualityChecker");

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
                <Header searchNode={<FullTextSearchInput />} />
                {isQualityEnabled ? <QualityScoreCard /> : null}
                <Main
                    openCatalogItemRef={openCatalogItemRef}
                    workspace={workspace}
                    backend={backend}
                    onCatalogItemOpenClick={onCatalogItemOpenClick}
                    onCatalogDetailOpened={onCatalogDetailOpened}
                    onCatalogDetailClosed={onCatalogDetailClosed}
                    onCatalogItemNavigation={onCatalogItemNavigation}
                />
            </PermissionsGate>
        </Layout>
    );
}
