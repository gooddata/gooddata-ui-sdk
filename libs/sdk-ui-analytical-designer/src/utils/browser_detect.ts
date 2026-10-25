// (C) 2007-2026 GoodData Corporation

import * as JqBrowser from "jquery.browser";

export function isMobile() {
    return !(JqBrowser as unknown as JqBrowser.Matchs).desktop;
}
