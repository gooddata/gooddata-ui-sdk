// (C) 2026 GoodData Corporation

import { type MessageDescriptor, defineMessages } from "react-intl";

import { convertError, isNotFound } from "@gooddata/sdk-ui";

const messages = defineMessages({
    updateFailed: { id: "analyticsCatalog.catalogItem.update.failed" },
    updateNotFound: { id: "analyticsCatalog.catalogItem.update.notFound" },
});

export type UpdateErrorMessage = {
    message: MessageDescriptor;
    errorDetail?: string;
};

export function getUpdateErrorMessage(error: Error): UpdateErrorMessage {
    if (isNotFound(convertError(error))) {
        return { message: messages.updateNotFound };
    }
    return { message: messages.updateFailed, errorDetail: `${error.name} ${error.message}` };
}
