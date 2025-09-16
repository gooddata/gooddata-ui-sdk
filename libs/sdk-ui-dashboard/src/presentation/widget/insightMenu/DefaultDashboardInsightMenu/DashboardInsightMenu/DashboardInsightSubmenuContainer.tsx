// (C) 2021-2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import { useIntl } from "react-intl";

import { UiIconButton } from "@gooddata/sdk-ui-kit";

import { DashboardInsightSubmenuHeader } from "./DashboardInsightSubmenuHeader.js";

interface IDashboardInsightSubmenuContainerProps {
    children: ReactNode;
    title: string;
    onClose: () => void;
    onBack?: () => void;
}

const screenWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardInsightSubmenuContainer(props: IDashboardInsightSubmenuContainerProps) {
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
}
