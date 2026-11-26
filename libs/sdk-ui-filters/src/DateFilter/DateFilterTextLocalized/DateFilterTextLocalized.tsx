// (C) 2019-2026 GoodData Corporation

import { useIntl } from "react-intl";

import { type WeekStart } from "@gooddata/sdk-model";
import { type IAlignPoint, ShortenedText } from "@gooddata/sdk-ui-kit";

import { type DateFilterLabelMode } from "../constants/i18n.js";
import { type DateFilterOption } from "../interfaces/index.js";
import { getDateFilterTitleUsingTranslator } from "../utils/Translations/DateFilterTitle.js";

interface IDateFilterTextLocalizedProps {
    dateFormat: string;
    filter?: DateFilterOption;
    labelMode?: DateFilterLabelMode;
    shortened?: boolean;
    tooltipAlignPoints?: IAlignPoint[];
    weekStart?: WeekStart;
}

export function DateFilterTextLocalized({
    dateFormat,
    filter,
    labelMode = "short",
    shortened = false,
    tooltipAlignPoints,
    weekStart,
}: IDateFilterTextLocalizedProps) {
    const dateFilterText = useDateFilterText({ filter, dateFormat, labelMode, weekStart });
    if (shortened) {
        return <ShortenedText tooltipAlignPoints={tooltipAlignPoints}>{dateFilterText}</ShortenedText>;
    }
    return <>{dateFilterText}</>;
}

export const useDateFilterText = ({
    filter,
    dateFormat,
    labelMode = "short",
    weekStart,
}: {
    filter?: DateFilterOption;
    dateFormat: string;
    weekStart?: WeekStart;
    /**
     * Label mode for display:
     * - "short": Abbreviated labels suitable for grouped lists (default)
     * - "full": Complete labels suitable for standalone display (buttons, selected values)
     */
    labelMode?: DateFilterLabelMode;
}) => {
    const intl = useIntl();
    return filter ? getDateFilterTitleUsingTranslator(filter, intl, labelMode, dateFormat, weekStart) : "";
};
