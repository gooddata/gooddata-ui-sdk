// (C) 2026 GoodData Corporation

import { type Ref, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IExportTemplate } from "@gooddata/sdk-model";
import {
    Button,
    ContentDivider,
    Dropdown,
    type IAlignPoint,
    UiIcon,
    UiTooltip,
    isEscapeKey,
} from "@gooddata/sdk-ui-kit";

const DROPDOWN_ALIGN_POINTS: IAlignPoint[] = [
    { align: "bc tc", offset: { x: 0, y: 0 } },
    { align: "tc bc", offset: { x: 0, y: 0 } },
];

const messages = defineMessages({
    settingsTitle: { id: "export.template.settings.title" },
    cancel: { id: "cancel" },
    save: { id: "save" },
    close: { id: "close" },
});

interface ISlidesTemplateSettingsProps {
    templates: IExportTemplate[];
    templateId?: string;
    onTemplateIdChange: (templateId: string | undefined) => void;
}

export function SlidesTemplateSettings({
    templates,
    templateId,
    onTemplateIdChange,
}: ISlidesTemplateSettingsProps) {
    const intl = useIntl();
    const [pendingTemplateId, setPendingTemplateId] = useState<string | undefined>(undefined);

    if (templates.length <= 1) {
        return null;
    }

    const settingsLabel = intl.formatMessage(messages.settingsTitle);
    const effectiveSelection = pendingTemplateId ?? templateId ?? templates[0]?.id;
    const isSaveDisabled = effectiveSelection === templateId;

    return (
        <Dropdown
            alignPoints={DROPDOWN_ALIGN_POINTS}
            closeOnParentScroll
            autofocusOnOpen
            onOpenStateChanged={(isOpen) => {
                if (!isOpen) {
                    setPendingTemplateId(undefined);
                }
            }}
            renderButton={({ toggleDropdown, buttonRef, ariaAttributes }) => (
                <button
                    className="gd-attachment-chip-button s-slides-template-button"
                    onClick={toggleDropdown}
                    ref={buttonRef as Ref<HTMLButtonElement>}
                    aria-label={settingsLabel}
                    {...ariaAttributes}
                >
                    <UiIcon type="settings" size={14} color="complementary-8" />
                </button>
            )}
            renderBody={({ closeDropdown, ariaAttributes: bodyAriaAttributes }) => (
                <div
                    className="gd-attachment-settings-dropdown s-slides-template-dropdown"
                    {...bodyAriaAttributes}
                    onKeyDown={(e) => {
                        if (isEscapeKey(e)) {
                            e.stopPropagation();
                            closeDropdown();
                        }
                    }}
                >
                    <h3 className="gd-list-title">{settingsLabel}</h3>
                    <span className="gd-close-button">
                        <Button
                            className="gd-button-link gd-button-icon-only gd-icon-cross s-dialog-close-button"
                            value=""
                            onClick={closeDropdown}
                            accessibilityConfig={{
                                ariaLabel: intl.formatMessage(messages.close),
                            }}
                        />
                    </span>
                    <div className="gd-attachment-settings-dropdown-content">
                        <div
                            className="gd-slides-template-dropdown-list"
                            role="radiogroup"
                            aria-label={settingsLabel}
                        >
                            {templates.map((template) => (
                                <UiTooltip
                                    key={template.id}
                                    triggerBy={["hover", "focus"]}
                                    arrowPlacement="bottom"
                                    content={template.name}
                                    anchor={
                                        <label className="input-radio-label s-slides-template-item">
                                            <input
                                                type="radio"
                                                className="input-radio"
                                                name="slidesTemplate"
                                                value={template.id}
                                                checked={effectiveSelection === template.id}
                                                onChange={() => setPendingTemplateId(template.id)}
                                            />
                                            <span className="input-label-text">{template.name}</span>
                                        </label>
                                    }
                                />
                            ))}
                        </div>
                    </div>
                    <ContentDivider className="gd-divider-without-margin" />
                    <div className="gd-attachment-settings-dropdown-footer">
                        <Button
                            value={intl.formatMessage(messages.cancel)}
                            className="gd-button-secondary"
                            onClick={closeDropdown}
                        />
                        <Button
                            value={intl.formatMessage(messages.save)}
                            className="gd-button-action"
                            onClick={() => {
                                if (effectiveSelection) {
                                    onTemplateIdChange(effectiveSelection);
                                }
                                closeDropdown();
                            }}
                            disabled={isSaveDisabled}
                        />
                    </div>
                </div>
            )}
        />
    );
}
