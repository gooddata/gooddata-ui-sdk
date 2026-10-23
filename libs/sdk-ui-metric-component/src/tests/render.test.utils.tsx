// (C) 2021-2026 GoodData Corporation

import { type ReactElement } from "react";

import { render } from "@testing-library/react";
import { IntlProvider } from "react-intl";

import { IntlWrapper } from "../translations/IntlWrapper.js";
import { DEFAULT_LANGUAGE, DEFAULT_MESSAGES } from "../translations/translations.js";

export function mountWithIntlApp(node: ReactElement): unknown {
    return render(
        <IntlProvider messages={DEFAULT_MESSAGES[DEFAULT_LANGUAGE]} locale={DEFAULT_LANGUAGE}>
            {node}
        </IntlProvider>,
    );
}
export function mountWithIntlComponentInCustomContainer(node: ReactElement): {
    container: HTMLElement;
} {
    const container = document.createElement("div");
    document.body.appendChild(container);

    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} defaultLocale={DEFAULT_LANGUAGE} messages={{}}>
            <IntlWrapper locale={DEFAULT_LANGUAGE}>{node}</IntlWrapper>
        </IntlProvider>,
        {
            container,
        },
    );
}

export function mountWithIntlComponent(node: ReactElement): { container: HTMLElement } {
    return render(
        <IntlProvider locale={DEFAULT_LANGUAGE} defaultLocale={DEFAULT_LANGUAGE} messages={{}}>
            <IntlWrapper locale={DEFAULT_LANGUAGE}>{node}</IntlWrapper>
        </IntlProvider>,
    );
}
