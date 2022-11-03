// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useIntl } from "react-intl";
import { Messages, IMessage } from "@gooddata/sdk-ui-kit";
import { useToastMessages } from "../../../model";

const commonReplacements = {
    b: (chunks: string) => <b>{chunks}</b>,
    i: (chunks: string) => <i>{chunks}</i>,
};

/**
 * @internal
 */
export const ToastMessages: React.FC = () => {
    const intl = useIntl();
    const { toastMessages, removeMessage } = useToastMessages();

    const kitCompatibleMessages = useMemo<IMessage[]>(() => {
        return toastMessages.map((toast) => {
            return {
                id: toast.id,
                type: toast.type,
                contrast: toast.contrast,
                duration: toast.duration,
                node: toast.titleId
                    ? intl.formatMessage(
                          { id: toast.titleId },
                          {
                              ...toast.titleValues,
                              ...commonReplacements,
                          },
                      )
                    : undefined,
                errorDetail:
                    toast.detailId &&
                    intl.formatMessage(
                        { id: toast.detailId },
                        {
                            ...toast.detailValues,
                            ...commonReplacements,
                        },
                    ),
                // only pass the showLess and showMore if there is any detail to be shown in the first place
                showLess: toast.detailId && toast.showLessId && intl.formatMessage({ id: toast.showLessId }),
                showMore: toast.detailId && toast.showMoreId && intl.formatMessage({ id: toast.showMoreId }),
                intensive: toast.intensive,
            };
        });
    }, [intl, toastMessages]);

    if (kitCompatibleMessages.length > 0) {
        return <Messages messages={kitCompatibleMessages} onMessageClose={removeMessage} />;
    }
    return null;
};
