// (C) 2026 GoodData Corporation

import { type ReactElement } from "react";

import { type IntlShape, defineMessages, useIntl } from "react-intl";

import { type IAutomationRecipient } from "@gooddata/sdk-model";
import { DETAILED_ANNOUNCEMENT_THRESHOLD } from "@gooddata/sdk-ui-kit";

import { getRecipientLabel } from "../../../utils/users.js";

const messages = defineMessages({
    selectedNone: { id: "dialogs.schedule.email.recipients.selected.none" },
    selectedFew: { id: "dialogs.schedule.email.recipients.selected.few" },
    selectedMany: { id: "dialogs.schedule.email.recipients.selected.many" },
    navigationHint: { id: "dialogs.schedule.email.recipients.navigationHint" },
});

function describeRecipients(intl: IntlShape, recipients: readonly IAutomationRecipient[]): string {
    const count = recipients.length;

    if (count === 0) {
        return intl.formatMessage(messages.selectedNone);
    }

    const selection =
        count <= DETAILED_ANNOUNCEMENT_THRESHOLD
            ? intl.formatMessage(messages.selectedFew, {
                  count,
                  names: intl.formatList(recipients.map(getRecipientLabel), { type: "unit" }),
              })
            : intl.formatMessage(messages.selectedMany, { count });

    return `${selection} ${intl.formatMessage(messages.navigationHint)}`;
}

interface IRecipientsSelectionDescriptionProps {
    id: string;
    recipients: readonly IAutomationRecipient[];
}

/**
 * Hidden screen reader description of the selected recipients, referenced by the recipients input.
 */
export function RecipientsSelectionDescription({
    id,
    recipients,
}: IRecipientsSelectionDescriptionProps): ReactElement {
    const intl = useIntl();

    return (
        <span id={id} hidden>
            {describeRecipients(intl, recipients)}
        </span>
    );
}
