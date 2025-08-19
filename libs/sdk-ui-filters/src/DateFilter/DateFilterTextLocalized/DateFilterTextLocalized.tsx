// (C) 2019-2025 GoodData Corporation
import React from "react";

import { useIntl } from "react-intl";

import { resolveLocale } from "@gooddata/sdk-ui";

import { DateFilterOption } from "../interfaces/index.js";
import { getDateFilterTitle } from "../utils/Translations/DateFilterTitle.js";

interface IDateFilterTextLocalizedProps {
    dateFormat: string;
    filter: DateFilterOption;
}

export const DateFilterTextLocalized: React.FC<IDateFilterTextLocalizedProps> = ({ dateFormat, filter }) => {
    const dateFilterText = useDateFilterText({ filter, dateFormat });
    return <>{dateFilterText}</>;
};

export const useDateFilterText = ({
    filter,
    dateFormat,
}: {
    filter: DateFilterOption;
    dateFormat: string;
}) => {
    const intl = useIntl();
    return getDateFilterTitle(filter, resolveLocale(intl.locale), dateFormat);
};
