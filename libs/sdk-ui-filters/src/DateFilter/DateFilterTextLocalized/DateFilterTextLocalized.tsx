// (C) 2019-2022 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { resolveLocale } from "@gooddata/sdk-ui";
import { DateFilterOption } from "../interfaces/index.js";
import { getDateFilterTitle } from "../utils/Translations/DateFilterTitle.js";

interface IDateFilterTextLocalizedProps {
    dateFormat: string;
    filter: DateFilterOption;
}

const DateFilterTextLocalizedComponent: React.FC<IDateFilterTextLocalizedProps & WrappedComponentProps> = ({
    dateFormat,
    filter,
    intl,
}) => <>{getDateFilterTitle(filter, resolveLocale(intl.locale), dateFormat)}</>;

export const DateFilterTextLocalized = injectIntl(DateFilterTextLocalizedComponent);
