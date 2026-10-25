// (C) 2007-2026 GoodData Corporation

import { type ReactNode } from "react";

import { FormattedMessage } from "react-intl";

export interface IShortcutPanelProps {
    children: ReactNode;
}

export function ShortcutPanel({ children }: IShortcutPanelProps) {
    return (
        <div className="adi-shortcuts-panel">
            <div className="adi-shortcut-title">
                <FormattedMessage id="dashboard.recommendation.recommended_steps" />
            </div>
            {children}
        </div>
    );
}
