// (C) 2021-2025 GoodData Corporation
import React from "react";
import { UiIconButton } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuHeader } from "./DashboardInsightSubmenuHeader.js";
import { useIntl } from "react-intl";

interface IDashboardInsightSubmenuContainerProps {
    children: React.ReactNode;
    title: string;
    onClose: () => void;
    onBack?: () => void;
}

const screenWrapperStyle: React.CSSProperties = { width: "100%" };

export const DashboardInsightSubmenuContainer: React.FC<IDashboardInsightSubmenuContainerProps> = (props) => {
    const { formatMessage } = useIntl();
    const closeLabel = formatMessage({ id: "menu.close" });

    return (
        <div className="configuration-panel">
            <div className="configuration-panel-header">
                <DashboardInsightSubmenuHeader title={props.title} onHeaderClick={props.onBack} />
                <UiIconButton
                    size={"xsmall"}
                    variant={"tertiary"}
                    icon={"close"}
                    label={closeLabel}
                    onClick={props.onClose}
                    dataId="s-configuration-panel-header-close-button"
                    dataTestId="s-configuration-panel-header-close-button"
                />
            </div>
            <div className="configuration-panel-screen" style={screenWrapperStyle}>
                {props.children}
            </div>
        </div>
    );
};
