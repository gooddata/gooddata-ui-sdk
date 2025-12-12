// (C) 2019-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { type DateFilterOption } from "../interfaces/index.js";
import { getDateFilterTitleUsingTranslator } from "../utils/Translations/DateFilterTitle.js";

interface IDateFilterTextLocalizedProps {
    dateFormat: string;
    filter?: DateFilterOption;
}

export function DateFilterTextLocalized({ dateFormat, filter }: IDateFilterTextLocalizedProps) {
    const dateFilterText = useDateFilterText({ filter, dateFormat });
    return <>{dateFilterText}</>;
}

export const useDateFilterText = ({
    filter,
    dateFormat,
}: {
    filter?: DateFilterOption;
    dateFormat: string;
}) => {
    const intl = useIntl();
    return filter ? getDateFilterTitleUsingTranslator(filter, intl, dateFormat) : "";
};
