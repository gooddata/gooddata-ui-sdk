// (C) 2025 GoodData Corporation

import { FormattedMessage } from "react-intl";

import { UiButton, UiSkeleton } from "@gooddata/sdk-ui-kit";

import { useKdaState } from "../providers/KdaState.js";

export function KeyDriversFooter() {
    const { state } = useKdaState();
    const isLoading = state.itemsStatus === "pending" || state.itemsStatus === "loading";

    return (
        <div>
            {isLoading ? (
                <UiSkeleton itemHeight={23} itemWidth={300} />
            ) : (
                <FormattedMessage
                    id="kdaDialog.dialog.keyDrives.overview.summary.drivers.description"
                    values={{
                        combinations: state.combinations,
                        attributes: state.attributes,
                        button: (chunks) => {
                            return (
                                <UiButton variant="tertiary" iconAfter="settings" label={chunks.join("")} />
                            );
                        },
                    }}
                />
            )}
        </div>
    );
}
