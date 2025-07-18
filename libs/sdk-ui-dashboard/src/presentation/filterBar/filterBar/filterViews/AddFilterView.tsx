// (C) 2024-2025 GoodData Corporation

import { useState } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { Typography, Input, Checkbox, Button, UiFocusManager } from "@gooddata/sdk-ui-kit";
import { useDashboardDispatch, saveFilterView } from "../../../../model/index.js";

export interface IAddFilterViewProps {
    onClose: () => void;
}

export function AddFilterView({ onClose }: IAddFilterViewProps) {
    const intl = useIntl();
    const [name, setName] = useState("");
    const [isDefault, setDefault] = useState(false);
    const isSaveEnabled = name.trim().length > 0;
    const dispatch = useDashboardDispatch();

    const onInputChange = (value: string | number) => setName(String(value));

    const handleSave = () => {
        if (isSaveEnabled) {
            dispatch(saveFilterView(name.trim(), isDefault));
            onClose();
        }
    };

    return (
        <UiFocusManager enableFocusTrap enableAutofocus>
            <div className="configuration-panel configuration-panel__filter-view__add">
                <div className="configuration-panel-header">
                    <Button onClick={onClose} className={"configuration-panel-header-title-button"}>
                        <Typography tagName="h3" className="configuration-panel-header-title">
                            <div className="gd-title-with-icon">
                                <span className="gd-icon-navigateleft" />
                                <FormattedMessage id="filters.filterViews.add.title" />
                            </div>
                        </Typography>
                    </Button>
                </div>
                <div className="configuration-category">
                    <Input
                        value={name}
                        isSmall={true}
                        onChange={onInputChange}
                        label={intl.formatMessage({ id: "filters.filterViews.add.nameLabel" })}
                        placeholder={intl.formatMessage({ id: "filters.filterViews.add.namePlaceholder" })}
                        onEnterKeyPress={handleSave}
                        autofocus={true}
                    />
                    <div className="gd-filter-view-add-checkbox-row">
                        <Checkbox
                            value={isDefault}
                            onChange={setDefault}
                            text={intl.formatMessage({ id: "filters.filterViews.add.setAsDefaultLabel" })}
                        />
                    </div>
                    <div className="gd-message progress gd-filter-view-add-hint">
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
