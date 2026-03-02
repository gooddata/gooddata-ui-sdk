// (C) 2025-2026 GoodData Corporation

import { type MouseEvent } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import { ErrorComponent } from "@gooddata/sdk-ui";
import { LoadingMask } from "@gooddata/sdk-ui-kit";

import { Layout } from "./Layout.js";
import type { OpenHandlerEvent } from "../catalogDetail/CatalogDetailContent.js";
import { type ICatalogItemRef } from "../catalogItem/types.js";
import { Header } from "../header/Header.js";
import { useCatalogItemOpen } from "../main/hooks/useCatalogItemOpen.js";
import { Main } from "../main/Main.js";
import { PermissionsGate } from "../permission/PermissionsGate.js";
import { useIsCatalogQualityEnabled } from "../quality/gate.js";
import { QualityScoreCard } from "../quality/QualityScoreCard.js";
import { FullTextSearchInput } from "../search/FullTextSearchInput.js";
import { CatalogTabs } from "../tabs/CatalogTabs.js";
import { useIsCatalogTrendingObjectsEnabled } from "../tabs/gate.js";

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
    const isTrendingEnabled = useIsCatalogTrendingObjectsEnabled();
    const isQualityEnabled = useIsCatalogQualityEnabled();

    const { open, openedItem, setItemOpened, onOpenDetail, onCloseDetail, onOpenClick } = useCatalogItemOpen(
        onCatalogItemOpenClick,
        onCatalogDetailOpened,
        onCatalogDetailClosed,
        openCatalogItemRef,
    );

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
                {isTrendingEnabled ? (
                    <CatalogTabs onItemClick={onOpenDetail} />
                ) : isQualityEnabled ? (
                    <QualityScoreCard />
                ) : null}
                <Main
                    workspace={workspace}
                    backend={backend}
                    open={open}
                    openedItem={openedItem}
                    setItemOpened={setItemOpened}
                    onOpenDetail={onOpenDetail}
                    onCloseDetail={onCloseDetail}
                    onOpenClick={onOpenClick}
                    onCatalogItemNavigation={onCatalogItemNavigation}
                />
            </PermissionsGate>
        </Layout>
    );
}
