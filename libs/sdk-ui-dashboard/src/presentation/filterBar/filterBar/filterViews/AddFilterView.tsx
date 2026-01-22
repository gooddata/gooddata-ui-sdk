// (C) 2024-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { Button, Checkbox, Input, UiFocusManager, UiSubmenuHeader } from "@gooddata/sdk-ui-kit";

import { saveFilterView } from "../../../../model/commands/filters.js";
import { useDashboardDispatch } from "../../../../model/react/DashboardStoreProvider.js";

export interface IAddFilterViewProps {
    onClose: () => void;
    onSave: () => void;
    titleId?: string;
}

export function AddFilterView({ onClose, onSave, titleId }: IAddFilterViewProps) {
    const intl = useIntl();
    const [name, setName] = useState("");
    const [isDefault, setDefault] = useState(false);
    const isSaveEnabled = name.trim().length > 0;
    const dispatch = useDashboardDispatch();

    const onInputChange = (value: string | number) => setName(String(value));

    const handleSave = useCallback(() => {
        if (isSaveEnabled) {
            dispatch(saveFilterView(name.trim(), isDefault));
            onSave();
        }
    }, [isSaveEnabled, isDefault, name, dispatch, onSave]);

    return (
        <UiFocusManager enableFocusTrap enableAutofocus>
            <div className="configuration-panel configuration-panel__filter-view__add">
                <UiSubmenuHeader
                    title={intl.formatMessage({ id: "filters.filterViews.add.title" })}
                    onBack={onClose}
                    backAriaLabel={intl.formatMessage({ id: "menu.back" })}
                    useShortenedTitle={false}
                    height="medium"
                    titleId={titleId}
                />
                <div className="configuration-category">
                    <Input
                        value={name}
                        isSmall
                        onChange={onInputChange}
                        label={intl.formatMessage({ id: "filters.filterViews.add.nameLabel" })}
                        placeholder={intl.formatMessage({ id: "filters.filterViews.add.namePlaceholder" })}
                        onEnterKeyPress={handleSave}
                        autofocus
                    />
                    <div className="gd-filter-view-add-checkbox-row">
                        <Checkbox
                            value={isDefault}
                            onChange={setDefault}
                            text={intl.formatMessage({ id: "filters.filterViews.add.setAsDefaultLabel" })}
                        />
                    </div>
                    <div className="gd-message information gd-filter-view-add-hint">
                        <FormattedMessage id="filters.filterViews.add.hint" />
                    </div>
                </div>
                <div className="configuration-panel-footer">
                    <div className="configuration-panel-footer__content">
                        <Button size="small" onClick={onClose} className="gd-button gd-button-secondary">
                            <FormattedMessage id="filters.filterViews.add.cancelButton" />
                        </Button>
                        <Button intent="action" size="small" onClick={handleSave} disabled={!isSaveEnabled}>
                            <FormattedMessage id="filters.filterViews.add.saveButton" />
                        </Button>
                    </div>
                </div>
            </div>
        </UiFocusManager>
    );
}
