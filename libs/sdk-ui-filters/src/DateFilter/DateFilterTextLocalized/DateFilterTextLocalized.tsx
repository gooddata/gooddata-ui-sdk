// (C) 2019 GoodData Corporation
import React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ILocale } from "@gooddata/sdk-ui";
import { DateFilterOption } from "../interfaces";
import { getDateFilterTitle } from "../utils/Translations/DateFilterTitle";

interface IDateFilterTextLocalizedProps {
    dateFormat: string;
    filter: DateFilterOption;
}

const DateFilterTextLocalizedComponent: React.FC<IDateFilterTextLocalizedProps & WrappedComponentProps> = ({
    dateFormat,
    filter,
    intl,
}) => <>{getDateFilterTitle(filter, intl.locale as ILocale, dateFormat)}</>;

export const DateFilterTextLocalized = injectIntl(DateFilterTextLocalizedComponent);
