// (C) 2025-2026 GoodData Corporation

import { type ComponentProps, memo } from "react";

import type { IntlShape } from "react-intl";

import { UiIcon, UiTooltip } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "./types.js";

type Props = ComponentProps<"div"> & {
    intl: IntlShape;
    item: ICatalogItem;
};

export function CatalogItemVisibilityIcon({ intl, item, ...htmlProps }: Props) {
    if (!item.isHidden) {
        return null;
    }

    return (
        <div {...htmlProps}>
            <UiTooltip
                arrowPlacement="top"
                optimalPlacement
                triggerBy={["hover", "focus"]}
                anchor={<UiIcon type="hiddenForAi" color="complementary-6" size={14} backgroundSize={26} />}
                content={intl.formatMessage({ id: "analyticsCatalog.column.isHidden.icon.tooltip" })}
                width={255}
            />
        </div>
    );
}

export const CatalogItemVisibilityIconMemo = memo(CatalogItemVisibilityIcon);
