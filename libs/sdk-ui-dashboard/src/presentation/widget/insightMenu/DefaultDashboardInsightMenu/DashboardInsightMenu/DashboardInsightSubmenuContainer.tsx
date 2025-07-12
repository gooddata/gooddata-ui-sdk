// (C) 2021-2025 GoodData Corporation
import { CSSProperties, ReactNode } from "react";
import { UiIconButton } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuHeader } from "./DashboardInsightSubmenuHeader.js";
import { useIntl } from "react-intl";

interface IDashboardInsightSubmenuContainerProps {
    children: ReactNode;
    title: string;
    onClose: () => void;
    onBack?: () => void;
}

const screenWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardInsightSubmenuContainer({
    children,
    title,
    onClose,
    onBack,
}: IDashboardInsightSubmenuContainerProps) {
    const { formatMessage } = useIntl();
    const closeLabel = formatMessage({ id: "menu.close" });

    return (
        <div className="configuration-panel">
            <div className="configuration-panel-header">
                <DashboardInsightSubmenuHeader title={title} onHeaderClick={onBack} />
                <UiIconButton
                    size={"xsmall"}
                    variant={"tertiary"}
                    icon={"close"}
                    label={closeLabel}
                    onClick={onClose}
                    dataId="s-configuration-panel-header-close-button"
                    dataTestId="s-configuration-panel-header-close-button"
                />
            </div>
            <div className="configuration-panel-screen" style={screenWrapperStyle}>
                {children}
            </div>
        </div>
    );
}
