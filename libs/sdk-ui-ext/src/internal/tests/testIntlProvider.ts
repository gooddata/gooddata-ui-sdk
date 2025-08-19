// (C) 2023-2025 GoodData Corporation
import { IntlShape, createIntl } from "react-intl";

import { translations } from "../utils/translations.js";

export function createIntlMock(locale = "en-US"): IntlShape {
    return createIntl({
        locale,
        messages: {
            ...translations[locale],
        },
    });
}
