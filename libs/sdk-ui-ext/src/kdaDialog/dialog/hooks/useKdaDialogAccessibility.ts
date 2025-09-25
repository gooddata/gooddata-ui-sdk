// (C) 2025 GoodData Corporation

import { useId, useMemo } from "react";

import { useIntl } from "react-intl";

export function useKdaDialogAccessibility(metric: string) {
    const intl = useIntl();
    const titleElementId = useId();

    return useMemo(() => {
        return {
            titleElementId,
            title: intl.formatMessage(
                {
                    id: "kdaDialog.dialog.title",
                },
                {
                    metric,
                },
            ),
            isModal: true,
            dialogId: "gd-kda-dialog",
            closeButton: {
                ariaLabel: intl.formatMessage({
                    id: "kdaDialog.dialog.closeLabel",
                }),
            },
        };
    }, [intl, metric, titleElementId]);
}
