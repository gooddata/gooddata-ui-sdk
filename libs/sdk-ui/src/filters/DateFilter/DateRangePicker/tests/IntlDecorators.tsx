// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { addLocaleDataToReactIntl } from "../../../../base/translations/IntlStore";
import { IntlWrapper } from "../../../../base/translations/IntlWrapper";

addLocaleDataToReactIntl();

export const IntlDecorator = (components: JSX.Element, locale: string = "en-US"): JSX.Element => (
    <IntlWrapper locale={locale}>{components}</IntlWrapper>
);
