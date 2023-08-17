// (C) 2023 GoodData Corporation
import { createIntl, IntlShape } from "react-intl";
import { translations } from "../utils/translations.js";

export function createIntlMock(locale = "en-US"): IntlShape {
    return createIntl({
        locale,
        messages: {
            ...translations[locale],
        },
    });
}
