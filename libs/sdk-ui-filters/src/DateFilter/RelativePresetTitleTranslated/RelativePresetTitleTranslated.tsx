// (C) 2007-2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { type DateFilterGranularity } from "@gooddata/sdk-model";

import { messages } from "../../locales.js";

export function RelativePresetTitleTranslated({ granularity }: { granularity: DateFilterGranularity }) {
    const intlDesc = messages[granularity] || null;
    if (!intlDesc) {
        return null;
    }

    return <FormattedMessage id={intlDesc.id} />;
}
