// (C) 2026 GoodData Corporation

import { type PublisherContentVersionV2 } from "@gooddata/sdk-model";

import { CoreErrorCode, type IErrorContext, newError, updateErrorContext } from "./errors.js";

/** @internal */
export const publisherContentVersionV2: PublisherContentVersionV2 = "2";

/** @internal */
export function assertPublisherContentVersionV2(
    { version }: { version: unknown },
    errorContext: IErrorContext | undefined,
): void {
    if (version !== publisherContentVersionV2) {
        throw newError(
            CoreErrorCode.UnsupportedContentVersion,
            [String(version), publisherContentVersionV2],
            updateErrorContext(errorContext, { path: ["version"] }),
        );
    }
}
