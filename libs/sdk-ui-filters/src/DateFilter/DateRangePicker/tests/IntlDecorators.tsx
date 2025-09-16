// (C) 2007-2025 GoodData Corporation

import { ReactElement } from "react";

import { IntlWrapper } from "@gooddata/sdk-ui";

export function IntlDecorator(components: ReactElement, locale: string = "en-US"): ReactElement {
    return <IntlWrapper locale={locale}>{components}</IntlWrapper>;
}
