// (C) 2026 GoodData Corporation

import { memo } from "react";

import { UiCertificationIcon } from "@gooddata/sdk-ui-kit";

import { type ICatalogItem } from "../catalogItem/types.js";

import { useIsCatalogCertificationEnabled } from "./gate.js";

type CatalogCertificationIconProps = {
    className?: string;
    certification?: ICatalogItem["certification"];
};

export function CatalogCertificationIcon({ className, certification }: CatalogCertificationIconProps) {
    const isCertificationEnabled = useIsCatalogCertificationEnabled();

    if (!isCertificationEnabled || certification?.status !== "CERTIFIED") {
        return null;
    }

    return (
        <span className={className}>
            <UiCertificationIcon certification={certification} />
        </span>
    );
}

export const CatalogCertificationIconMemo = memo(CatalogCertificationIcon);
