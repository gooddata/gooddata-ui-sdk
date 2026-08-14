// (C) 2026 GoodData Corporation

import { type ReactNode, type Ref } from "react";

import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { UiDropdown } from "../UiDropdown/UiDropdown.js";
import { UiIconButton } from "../UiIconButton/UiIconButton.js";
import { UiRadio } from "../UiRadio/UiRadio.js";

import { type ConfigEditorLanguage } from "./configEditorLanguage.js";
import { type IUiConfigEditorContextMenuProps, type IUiConfigEditorLabels } from "./types.js";

const { e } = bem("gd-ui-kit-config-editor");

interface IConfigEditorToolbarProps {
    languages: ConfigEditorLanguage[];
    displayLanguage: ConfigEditorLanguage;
    /** Called when the user picks a language on this toolbar (as opposed to a remote prop change). */
    onSelectLanguage: (next: ConfigEditorLanguage) => void;
    labels: IUiConfigEditorLabels | undefined;
    /** `undefined` when there is nothing to re-format, which disables the action. */
    canAutoFormat: boolean;
    onAutoFormat: () => void;
    renderContextMenu?: (props: IUiConfigEditorContextMenuProps) => ReactNode;
    readOnly: boolean;
    disabled: boolean;
    /** Scoped to the editor instance so several editors' radio groups do not merge. */
    languageGroupName: string;
    contextMenuButtonId: string;
}

/**
 * The editor's fixed-height toolbar: the language radio group (only when more than one language is
 * offered), the Auto-format action, and the optional context-menu button with its popover.
 */
export function ConfigEditorToolbar({
    languages,
    displayLanguage,
    onSelectLanguage,
    labels,
    canAutoFormat,
    onAutoFormat,
    renderContextMenu,
    readOnly,
    disabled,
    languageGroupName,
    contextMenuButtonId,
}: IConfigEditorToolbarProps) {
    const languageLabel = (language: ConfigEditorLanguage) =>
        labels?.languages?.[language] ?? language.toUpperCase();

    return (
        <div className={e("toolbar")}>
            {languages.length > 1 ? (
                <div
                    className={e("languages")}
                    role="radiogroup"
                    aria-label={labels?.languageSwitcher ?? "Editor language"}
                >
                    {languages.map((radioLanguage) => (
                        <UiRadio
                            key={radioLanguage}
                            // One `name` across all of them, so they behave as one native radio
                            // group: arrow keys move between them and only one can be chosen.
                            name={languageGroupName}
                            value={radioLanguage}
                            label={languageLabel(radioLanguage)}
                            checked={displayLanguage === radioLanguage}
                            disabled={disabled}
                            onChange={() => onSelectLanguage(radioLanguage)}
                            dataTestId={`s-config-editor-language-${radioLanguage}`}
                        />
                    ))}
                </div>
            ) : null}
            <div className={e("actions", { withMenu: !!renderContextMenu })}>
                <UiButton
                    size="medium"
                    variant="linkDimmed"
                    label={labels?.autoFormat ?? "Auto-format"}
                    // Nothing to re-format when the draft is blank or cannot be parsed, so the
                    // action is disabled rather than silently doing nothing.
                    isDisabled={disabled || readOnly || !canAutoFormat}
                    onClick={onAutoFormat}
                    dataTestId="s-config-editor-auto-format"
                />
                {renderContextMenu ? (
                    <UiDropdown
                        placement="bottom-end"
                        // The dropdown positions against the button, but the design hangs the
                        // menu from the toolbar's bottom edge: the 32px button centered in the
                        // 36px toolbar leaves 2px below it, plus the divider's 1px.
                        offset={3}
                        closeOnEscape
                        closeOnOutsideClick
                        autofocusOnOpen
                        // The popup role is deliberately left at its default. Setting it to
                        // "menu" would put `role="menu"` on the positioning wrapper as well, and
                        // a menu nested directly inside another menu is invalid — the content is
                        // expected to be a `UiMenu`, which brings that role itself.
                        renderButton={({ ref, toggleDropdown, isOpen, ariaAttributes }) => (
                            <UiIconButton
                                ref={ref as Ref<HTMLButtonElement>}
                                id={contextMenuButtonId}
                                icon="ellipsis"
                                size="medium"
                                variant="tertiary"
                                isActive={isOpen}
                                isDisabled={disabled}
                                onClick={toggleDropdown}
                                label={labels?.contextMenu ?? "More actions"}
                                accessibilityConfig={{ ariaLabel: labels?.contextMenu ?? "More actions" }}
                                ariaAttributes={ariaAttributes}
                                dataTestId="s-config-editor-context-menu-button"
                            />
                        )}
                        renderBody={({ closeDropdown, ariaAttributes }) =>
                            renderContextMenu({
                                onClose: closeDropdown,
                                ariaAttributes: {
                                    ...ariaAttributes,
                                    "aria-labelledby": contextMenuButtonId,
                                },
                            })
                        }
                    />
                ) : null}
            </div>
        </div>
    );
}
