// (C) 2022-2026 GoodData Corporation

import { GdcAdEventType } from "@gooddata/sdk-embedding";

import { adPostEvent } from "./post_event_helper.js";

export function emitApiTokenIsAboutToExpire(): void {
    // oxlint-disable-next-line eslint-js/no-console
    console.log("API token is about to expire");
    adPostEvent(GdcAdEventType.ApiTokenIsAboutToExpire, {});
}
