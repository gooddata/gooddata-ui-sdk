// (C) 2025-2026 GoodData Corporation

import { IntlWrapper } from "../presentation/localization/IntlWrapper.js";

import { KdaDialog as KdaDialogComponent } from "./dialog/KdaDialog.js";
import { KdaStateProvider } from "./providers/KdaState.js";
import { type IKdaDialogProps } from "./types.js";

/**
 * @internal
 */
export function KdaDialog(props: IKdaDialogProps) {
    return (
        <IntlWrapper locale={props.locale ?? "en"}>
            <KdaStateProvider>
                <KdaDialogComponent {...props} />
            </KdaStateProvider>
        </IntlWrapper>
    );
}
