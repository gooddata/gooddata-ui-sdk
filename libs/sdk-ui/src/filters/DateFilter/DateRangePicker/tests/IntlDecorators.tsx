// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { IntlWrapper } from "../../../../base/localization/IntlWrapper";

export const IntlDecorator = (components: JSX.Element, locale: string = "en-US"): JSX.Element => (
    <IntlWrapper locale={locale}>{components}</IntlWrapper>
);
