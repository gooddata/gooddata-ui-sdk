// (C) 2007-2019 GoodData Corporation
import React from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";

export const IntlDecorator = (components: JSX.Element, locale: string = "en-US"): JSX.Element => (
    <IntlWrapper locale={locale}>{components}</IntlWrapper>
);
