// (C) 2007-2026 GoodData Corporation

import { UiIconButton, UiTooltip } from "@gooddata/sdk-ui-kit";

export type IFilterModeMenuSectionHeaderProps = {
    title: string;
    tooltip: string;
};

export function FilterModeMenuSectionHeader({ title, tooltip }: IFilterModeMenuSectionHeaderProps) {
    return (
        <div className="gd-filter-mode-menu__section">
            <div className="gd-filter-mode-menu__section-label">
                <span className="gd-filter-mode-menu__section-text">{title}</span>
                <UiTooltip
                    anchor={
                        <span className="gd-filter-mode-menu__section-icon" aria-hidden="true">
                            <UiIconButton
                                icon="question"
                                size="xsmall"
                                variant="tertiary"
                                iconColor="complementary-7"
                            />
                        </span>
                    }
                    content={tooltip}
                    triggerBy={["hover", "focus"]}
                    arrowPlacement="left"
                />
            </div>
        </div>
    );
}
