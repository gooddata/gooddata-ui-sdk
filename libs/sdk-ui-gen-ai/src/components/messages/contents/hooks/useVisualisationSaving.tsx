// (C) 2025 GoodData Corporation
import { useEffect, useState } from "react";

import { IGenAIVisualization } from "@gooddata/sdk-model";

export function useVisualisationSaving(visualization: IGenAIVisualization, onClose: () => void) {
    const [savingStarted, setSavingStarted] = useState<boolean>(false);

    // Close the dialog automatically once the item is saved
    const isSaving = visualization.saving;
    useEffect(() => {
        if (savingStarted && !isSaving) {
            setSavingStarted(false);
            onClose();
        }
    }, [savingStarted, isSaving, onClose]);

    return {
        setSavingStarted,
        savingStarted,
    };
}
