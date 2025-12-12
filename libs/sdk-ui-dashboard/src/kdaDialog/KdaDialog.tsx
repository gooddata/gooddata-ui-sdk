// (C) 2025 GoodData Corporation

import { KdaDialog as KdaDialogComponent } from "./dialog/KdaDialog.js";
import { KdaStateProvider } from "./providers/KdaState.js";
import { type IKdaDialogProps } from "./types.js";
import { IntlWrapper } from "../presentation/localization/index.js";

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
