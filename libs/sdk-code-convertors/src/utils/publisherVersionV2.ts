// (C) 2026 GoodData Corporation

import { type PublisherContentVersionV2 } from "@gooddata/sdk-model";

import { describeValue } from "./describeValue.js";
import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "./errors.js";

/** @internal */
export const publisherContentVersionV2: PublisherContentVersionV2 = "2";

/** @internal */
export function assertPublisherContentVersionV2(
    { version }: { version: unknown },
    errorContext: IErrorContext | undefined,
): void {
    if (version === publisherContentVersionV2) {
        return;
    }
    const context = updateErrorContext(errorContext, { path: ["version"] });
    if (version === undefined) {
        throw newError(CoreErrorCode.MissingRequiredKey, ["version"], context);
    }
    throw newError(
        CoreErrorCode.UnsupportedContentVersion,
        [publisherContentVersionV2, describeValue(version)],
        context,
    );
}
