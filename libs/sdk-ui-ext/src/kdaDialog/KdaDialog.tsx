// (C) 2025 GoodData Corporation

import { KdaDialog as KdaDialogComponent } from "./dialog/KdaDialog.js";
import { KdaStateProvider } from "./providers/KdaState.js";
import { IKdaDialogProps } from "./types.js";
import { InternalIntlWrapper } from "../internal/index.js";

/**
 * @internal
 */
export function KdaDialog(props: IKdaDialogProps) {
    return (
        <InternalIntlWrapper locale={props.locale ?? "en"}>
            <KdaStateProvider>
                <KdaDialogComponent {...props} />
            </KdaStateProvider>
        </InternalIntlWrapper>
    );
}
