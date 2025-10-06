// (C) 2022-2025 GoodData Corporation

import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

interface IDefaultSubmenuHeaderProps {
    title: string;
    backLabel?: string;
    closeLabel?: string;
    onGoBack?: () => void;
    onClose: () => void;
}

export function DefaultSubmenuHeader({
    title,
    backLabel,
    closeLabel,
    onGoBack,
    onClose,
}: IDefaultSubmenuHeaderProps) {
    return (
        <div className="dashboard-configuration-panel-header">
            <UiSubmenuHeader
                title={title}
                onBack={onGoBack}
                onClose={onClose}
                backAriaLabel={backLabel}
                closeAriaLabel={closeLabel}
                useShortenedTitle={false}
            />
        </div>
    );
}
