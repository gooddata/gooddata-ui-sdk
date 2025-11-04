// (C) 2025 GoodData Corporation

import { memo } from "react";

import { useIntl } from "react-intl";

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

import { useFilterActions, useFilterState } from "./FilterContext.js";
import { testIds } from "../automation/index.js";

export function FilterResetButton() {
    const intl = useIntl();
    const { isModified } = useFilterState();
    const { reset } = useFilterActions();

    if (!isModified) {
        return null;
    }

    const resetLabel = intl.formatMessage({ id: "analyticsCatalog.filter.reset" });

    return (
        <div className="gd-analytics-catalog__filter__reset" data-testid={testIds.filterReset}>
            <UiTooltip
                triggerBy={["hover", "focus"]}
                anchor={
                    <UiIconButton
                        icon="history"
                        size="small"
                        variant="tertiary"
                        onClick={reset}
                        label={resetLabel}
                    />
                }
                content={resetLabel}
            />
        </div>
    );
}

export const FilterResetButtonMemo = memo(FilterResetButton);
