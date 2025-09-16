// (C) 2025 GoodData Corporation

import { memo } from "react";

import type { IntlShape } from "react-intl";

import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

type Props = {
    intl: IntlShape;
};

export function CatalogItemLock({ intl }: Props) {
    return (
        <UiTooltip
            arrowPlacement="top"
            optimalPlacement
            triggerBy={["hover"]}
            anchor={<UiIcon type="lock" color="complementary-7" size={16} ariaHidden={true} />}
            content={intl.formatMessage({ id: "analyticsCatalog.catalogItem.lock" })}
            width={255}
        />
    );
}

export const CatalogItemLockMemo = memo(CatalogItemLock);
