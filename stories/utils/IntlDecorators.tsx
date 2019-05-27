// (C) 2007-2019 GoodData Corporation
import * as React from "react";
import { IntlWrapper } from "../../src/internal/utils/intlProvider";

export const IntlDecorator = (components: JSX.Element): JSX.Element => (
    <IntlWrapper locale="en-US">{components}</IntlWrapper>
);
