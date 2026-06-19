// (C) 2025-2026 GoodData Corporation

import { type RefObject, useId, useMemo, useRef, useState } from "react";

import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import { type IUiComboboxOption } from "../UiCombobox/types.js";
import { UiCombobox } from "../UiCombobox/UiCombobox.js";
import { UiComboboxInput } from "../UiCombobox/UiComboboxInput.js";
import { UiComboboxList } from "../UiCombobox/UiComboboxList.js";
import {
    UiComboboxListItem,
    UiComboboxListItemCreatableLabel,
    UiComboboxListItemLabel,
} from "../UiCombobox/UiComboboxListItem.js";
import { UiComboboxPopup } from "../UiCombobox/UiComboboxPopup.js";
import { UiPopover } from "../UiPopover/UiPopover.js";
import { UiTooltip } from "../UiTooltip/UiTooltip.js";

import { useResponsiveTags } from "./hooks/useResponsiveTags.js";
import { useTagsInteractions } from "./interactions.js";
import { type IUiTagDef, type IUiTagsProps } from "./types.js";
import { UiTag } from "./UiTag.js";

const { b, e } = bem("gd-ui-kit-tags");

const defaultAccessibilityConfig: IAccessibilityConfigBase = {};

/**
 * @internal
 */
export function UiTags({
    tags,
    tagOptions,
    addLabel = "Add tag",
    nameLabel = "Name",
    cancelLabel = "Cancel",
    closeLabel = "Close",
    saveLabel = "Save",
    noTagsLabel = "No tags",
    moreLabel = "More tags",
    removeLabel = "Remove",
    creatableLabel = "(Create new)",
    mode = "single-line",
    size = "small",
    canDeleteTags = true,
    canCreateTag = true,
    readOnly = false,
    onTagClick,
    onTagAdd = () => {},
    onTagRemove = () => {},
    accessibilityConfig = defaultAccessibilityConfig,
    renderAddButton,
}: IUiTagsProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);
    const [popupOpen, setPopupOpen] = useState(false);
    const popupId = useId();

    const isDeletable = canDeleteTags && !readOnly;
    // A custom add-button slot takes precedence over the built-in create-tag combobox.
    const hasCustomAddButton = !!renderAddButton && !readOnly;
    const isAddable = canCreateTag && !readOnly && !hasCustomAddButton;

    const {
        rootRef,
        showedTags,
        hiddenTags,
        tagsContainerRef,
        hiddenTagsContainerRef,
        tooltipTagsContainerRef,
        addButtonRef,
        allContainerRef,
        tooltipWidth,
        availableWidth,
        lastAvailableWidth,
        setTooltipContainer,
    } = useResponsiveTags(tags, mode, [canCreateTag, canDeleteTags, readOnly, hasCustomAddButton]);

    const items = [...showedTags, hiddenTags];

    const {
        interactionState,
        onAddOpen,
        onAddClose,
        onMoreOpen,
        onMoreClose,
        tag,
        setTag,
        onTagClickHandler,
        onTagRemoveHandler,
        onTagAddHandler,
    } = useTagsInteractions(
        tagsContainerRef,
        tooltipTagsContainerRef,
        showedTags,
        hiddenTags,
        onTagAdd,
        onTagRemove,
        onTagClick,
    );

    const [morePopoverOpen, setMorePopoverOpen] = useState(false);
    const morePopoverId = useId();
    const groupLabelId = useId();
    const hasTagClickHandler = onTagClick !== undefined;
    const groupLabelledBy = accessibilityConfig?.ariaLabelledBy ?? groupLabelId;
    const groupLabelText =
        accessibilityConfig?.ariaLabel ?? (tags.length === 1 ? "Tags, 1" : `Tags, ${tags.length}`);

    const comboboxOptions: IUiComboboxOption[] = useMemo(() => {
        if (!tagOptions) {
            return [];
        }
        const tagIds = new Set(tags.map((tag) => tag.id));
        return tagOptions
            .filter((tagOption) => !tagIds.has(tagOption.id))
            .map((tagOption) => ({ id: tagOption.id, label: tagOption.label }));
    }, [tagOptions, tags]);

    return (
        <div
            ref={rootRef}
            className={b({ readOnly, mode })}
            aria-labelledby={groupLabelledBy}
            aria-describedby={accessibilityConfig?.ariaDescribedBy}
            role={accessibilityConfig?.role ?? "group"}
        >
            {accessibilityConfig?.ariaLabelledBy ? null : (
                <span className="sr-only" id={groupLabelId}>
                    {groupLabelText}
                </span>
            )}

            <div className={e("shadow-container")} ref={allContainerRef}>
                {tags.map((tag) => {
                    return (
                        <UiTag
                            key={getKey(tag, isDeletable, readOnly)}
                            tag={tag}
                            isDeletable={isDeletable}
                            size={size}
                        />
                    );
                })}
            </div>
            <div className={e("tags-container")} ref={tagsContainerRef}>
                {items.map((tag, i) => {
                    if (Array.isArray(tag)) {
                        if (hiddenTags.length === 0) {
                            return null;
                        }
                        return (
                            <div
                                key={i}
                                className={e("hidden-tags")}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                {hiddenTags.length > 0 ? (
                                    <UiPopover
                                        id={morePopoverId}
                                        onOpen={() => {
                                            setMorePopoverOpen(true);
                                            onMoreOpen();
                                        }}
                                        onClose={() => {
                                            setMorePopoverOpen(false);
                                            onMoreClose();
                                        }}
                                        enableFocusTrap
                                        initialFocus={tooltipTagsContainerRef as RefObject<HTMLElement>}
                                        returnFocusTo={hiddenTagsContainerRef as RefObject<HTMLElement>}
                                        anchorAccessibilityConfig={{
                                            ariaHaspopup: "dialog",
                                            ariaControls: morePopoverId,
                                        }}
                                        anchor={
                                            <UiButton
                                                label={`+${hiddenTags.length}`}
                                                size={"small"}
                                                variant={"tertiary"}
                                                accessibilityConfig={{
                                                    ariaLabel: moreLabel,
                                                    ariaExpanded: morePopoverOpen,
                                                }}
                                                ref={(ref) => {
                                                    hiddenTagsContainerRef.current = ref;
                                                }}
                                            />
                                        }
                                        width={300}
                                        title={moreLabel}
                                        content={() => (
                                            <div
                                                className={e("tags-more-tooltip")}
                                                ref={(ref) => {
                                                    tooltipTagsContainerRef.current = ref;
                                                    setTooltipContainer(ref);
                                                }}
                                            >
                                                {hiddenTags.map((tag, i) => {
                                                    return (
                                                        <UiTag
                                                            key={i}
                                                            tag={tag}
                                                            deleteLabel={removeLabel}
                                                            isDeletable={isDeletable}
                                                            isDisabled={readOnly}
                                                            size={size}
                                                            maxWidth={tooltipWidth}
                                                            onDelete={onTagRemoveHandler}
                                                            onClick={
                                                                hasTagClickHandler
                                                                    ? onTagClickHandler
                                                                    : undefined
                                                            }
                                                        />
                                                    );
                                                })}
                                            </div>
                                        )}
                                        footer={({ onClose }) => (
                                            <>
                                                <UiButton
                                                    ref={(ref) => {
                                                        interactionState.current.close = ref!;
                                                    }}
                                                    label={closeLabel}
                                                    variant={"secondary"}
                                                    onClick={() => {
                                                        onClose();
                                                    }}
                                                />
                                            </>
                                        )}
                                    />
                                ) : null}
                            </div>
                        );
                    }
                    return (
                        <UiTag
                            tag={tag}
                            isDeletable={isDeletable}
                            isDisabled={readOnly}
                            deleteLabel={removeLabel}
                            size={size}
                            onDelete={onTagRemoveHandler}
                            onClick={hasTagClickHandler ? onTagClickHandler : undefined}
                            key={getKey(tag, isDeletable, readOnly)}
                            maxWidth={i === showedTags.length - 1 ? lastAvailableWidth : availableWidth}
                        />
                    );
                })}
                {hasCustomAddButton ? (
                    <div
                        className={e("add-button")}
                        ref={addButtonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                        onKeyDown={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {renderAddButton?.()}
                    </div>
                ) : isAddable ? (
                    <div
                        className={e("add-button")}
                        ref={addButtonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <UiPopover
                            id={popupId}
                            onOpen={() => {
                                onAddOpen();
                                setPopupOpen(true);
                            }}
                            onClose={() => {
                                setTag("");
                                onAddClose();
                                setPopupOpen(false);
                            }}
                            enableFocusTrap
                            anchor={
                                <UiTooltip
                                    content={addLabel}
                                    triggerBy={["hover", "focus"]}
                                    anchorWrapperStyles={{ display: "flex", alignItems: "center" }}
                                    anchor={
                                        <UiButton
                                            label={showedTags.length > 0 ? "" : addLabel}
                                            accessibilityConfig={{
                                                ariaHaspopup: true,
                                                ariaControls: popupId,
                                                ariaLabel: addLabel,
                                                ariaExpanded: popupOpen,
                                            }}
                                            size={"small"}
                                            iconBefore={"plus"}
                                            variant={"tertiary"}
                                            ref={(ref) => {
                                                interactionState.current.add = ref;
                                            }}
                                        />
                                    }
                                />
                            }
                            title={addLabel}
                            initialFocus={inputRef as RefObject<HTMLElement>}
                            content={({ onClose }) => (
                                <UiCombobox
                                    options={comboboxOptions}
                                    value={tag}
                                    onValueChange={setTag}
                                    creatable
                                >
                                    <UiComboboxInput
                                        ref={(node) => {
                                            inputRef.current = node;
                                            interactionState.current.input = node;
                                        }}
                                        name="add-input"
                                        accessibilityConfig={{ ariaLabel: nameLabel }}
                                        onKeyDown={(event) => {
                                            if (event.isDefaultPrevented()) {
                                                return;
                                            }
                                            if (event.key === "Enter") {
                                                onTagAddHandler();
                                                onClose();
                                            }
                                        }}
                                    />
                                    <UiComboboxPopup>
                                        <UiComboboxList>
                                            {(option, index) => (
                                                <UiComboboxListItem
                                                    key={option.id}
                                                    option={option}
                                                    index={index}
                                                >
                                                    <UiComboboxListItemLabel>
                                                        {option.label}
                                                    </UiComboboxListItemLabel>
                                                    {option.creatable ? (
                                                        <UiComboboxListItemCreatableLabel>
                                                            {creatableLabel}
                                                        </UiComboboxListItemCreatableLabel>
                                                    ) : null}
                                                </UiComboboxListItem>
                                            )}
                                        </UiComboboxList>
                                    </UiComboboxPopup>
                                </UiCombobox>
                            )}
                            footer={({ onClose }) => (
                                <>
                                    <UiButton
                                        label={cancelLabel}
                                        variant={"secondary"}
                                        onClick={onClose}
                                        ref={(ref) => {
                                            interactionState.current.close = ref!;
                                        }}
                                    />
                                    <UiButton
                                        label={saveLabel}
                                        isDisabled={!tag}
                                        variant={"primary"}
                                        onClick={() => {
                                            onTagAddHandler();
                                            onClose();
                                        }}
                                        ref={(ref) => {
                                            interactionState.current.save = ref!;
                                        }}
                                    />
                                </>
                            )}
                        />
                    </div>
                ) : null}
                {!isAddable && !hasCustomAddButton && tags.length === 0 ? (
                    <div className={e("empty-state")}>{noTagsLabel}</div>
                ) : null}
            </div>
        </div>
    );
}

function getKey(tag: IUiTagDef, isDeletable: boolean, readOnly: boolean) {
    return [tag.id, tag.isDeletable, isDeletable, readOnly].filter(Boolean).join("-");
}
