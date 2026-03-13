// (C) 2020-2026 GoodData Corporation

import { LoadingSpinner, UiButton } from "@gooddata/sdk-ui-kit";

interface IDrillFiltersTriggerProps {
    label: string;
    onClick: () => void;
    isLoading: boolean;
}

export function DrillFiltersTrigger({ label, onClick, isLoading }: IDrillFiltersTriggerProps) {
    return (
        <div className="gd-drill-filter-config-link">
            {isLoading ? (
                <LoadingSpinner className="small" />
            ) : (
                <UiButton variant="tertiary" size="small" label={label} onClick={onClick} />
            )}
        </div>
    );
}
