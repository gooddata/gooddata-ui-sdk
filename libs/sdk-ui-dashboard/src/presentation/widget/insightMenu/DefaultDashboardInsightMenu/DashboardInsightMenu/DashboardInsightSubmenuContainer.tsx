// (C) 2021-2026 GoodData Corporation

import { type CSSProperties, type ReactNode } from "react";

import { useIntl } from "react-intl";

import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

interface IDashboardInsightSubmenuContainerProps {
    children: ReactNode;
    title: string;
    tooltipText?: string;
    onClose: () => void;
    onBack?: () => void;
}

const screenWrapperStyle: CSSProperties = { width: "100%" };

export function DashboardInsightSubmenuContainer(props: IDashboardInsightSubmenuContainerProps) {
    const { formatMessage } = useIntl();
    const closeLabel = formatMessage({ id: "menu.close" });

    return (
        <div className="configuration-panel">
            <UiSubmenuHeader
                title={props.title}
                tooltipText={props.tooltipText}
                onBack={props.onBack}
                onClose={props.onClose}
                closeAriaLabel={closeLabel}
                height="large"
            />
            <div className="configuration-panel-screen" style={screenWrapperStyle}>
                {props.children}
            </div>
        </div>
    );
}
