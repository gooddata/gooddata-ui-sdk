// (C) 2025-2026 GoodData Corporation

import { useId, useMemo } from "react";

import { useIntl } from "react-intl";

export function useKdaDialogAccessibility(metric: string, isMinimized: boolean, titleElementId?: string) {
    const intl = useIntl();
    const generatedTitleElementId = useId();
    const titleId = titleElementId ?? generatedTitleElementId;

    return useMemo(() => {
        return {
            descriptionElementId: titleId,
            title: intl.formatMessage(
                {
                    id: "kdaDialog.dialog.title",
                },
                {
                    metric,
                },
            ),
            isModal: !isMinimized,
            dialogId: "gd-kda-dialog",
            closeButton: {
                ariaLabel: intl.formatMessage({
                    id: "kdaDialog.dialog.closeLabel",
                }),
            },
        };
    }, [intl, metric, titleId, isMinimized]);
}
