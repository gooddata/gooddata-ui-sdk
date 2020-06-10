// (C) 2019 GoodData Corporation
import * as React from "react";
import { injectIntl, WrappedComponentProps } from "react-intl";
import { ILocale } from "@gooddata/sdk-ui";
import { DateFilterOption } from "../interfaces";
import { getDateFilterTitle } from "../utils/Translations/DateFilterTitle";

interface IDateFilterTextLocalizedProps {
    filter: DateFilterOption;
}

const DateFilterTextLocalizedComponent: React.FC<IDateFilterTextLocalizedProps & WrappedComponentProps> = ({
    filter,
    intl,
}) => <>{getDateFilterTitle(filter, intl.locale as ILocale)}</>;

export const DateFilterTextLocalized = injectIntl(DateFilterTextLocalizedComponent);
