// (C) 2007-2022 GoodData Corporation
import React from "react";
import { FormattedMessage } from "react-intl";
import { DateFilterGranularity } from "@gooddata/sdk-model";
import { messages } from "../../locales.js";

export const RelativePresetTitleTranslated: React.FC<{
    granularity: DateFilterGranularity;
}> = ({ granularity }) => {
    const intlDesc = messages[granularity] || null;
    if (!intlDesc) {
        return null;
    }

    return <FormattedMessage id={intlDesc.id} />;
};
