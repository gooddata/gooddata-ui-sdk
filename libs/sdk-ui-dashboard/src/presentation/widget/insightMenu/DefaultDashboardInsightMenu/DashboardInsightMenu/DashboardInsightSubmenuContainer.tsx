// (C) 2021-2025 GoodData Corporation

import { CSSProperties, ReactNode } from "react";

import { useIntl } from "react-intl";

import { UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

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
            <UiSubmenuHeader
                title={props.title}
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
