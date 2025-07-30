// (C) 2007-2025 GoodData Corporation
import React, { ReactElement } from "react";
import { IntlWrapper } from "@gooddata/sdk-ui";

export const IntlDecorator = (components: ReactElement, locale: string = "en-US"): ReactElement => (
    <IntlWrapper locale={locale}>{components}</IntlWrapper>
);
