// (C) 2026 GoodData Corporation

import { memo } from "react";

import { type ISemanticSearchResultItem } from "@gooddata/sdk-model";
import { UiCertificationIcon } from "@gooddata/sdk-ui-kit";

import { useIsSearchCertificationEnabled } from "./gate.js";

type SearchCertificationIconProps = {
    certification?: ISemanticSearchResultItem["certification"];
};

export function SearchCertificationIcon({ certification }: SearchCertificationIconProps) {
    const isCertificationEnabled = useIsSearchCertificationEnabled();

    if (!isCertificationEnabled || certification?.status !== "CERTIFIED") {
        return null;
    }

    return (
        <span className="gd-semantic-search__certification-icon">
            <UiCertificationIcon
                certification={{
                    status: certification.status,
                    message: certification.certificationMessage,
                }}
                size={14}
                tabIndex={-1}
            />
        </span>
    );
}

export const SearchCertificationIconMemo = memo(SearchCertificationIcon);
