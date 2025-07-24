// (C) 2025 GoodData Corporation
import React from "react";
import { UiIcon } from "../../UiIcon/UiIcon.js";
import { useIntl } from "react-intl";
import { messages } from "../locales.js";
import { e } from "../asyncTableBem.js";

export const UiAsyncTableEmptyState = () => {
    const intl = useIntl();

    return (
        <div className={e("empty-state")}>
            <UiIcon type="search" color="complementary-5" size={44} />
            <div className={e("empty-state-title")}>{intl.formatMessage(messages.noMatchFound)}</div>
            <div className={e("empty-state-description")}>
                {intl.formatMessage(messages.tryAdjustingFilters)}
            </div>
        </div>
    );
};
