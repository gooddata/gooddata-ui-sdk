// (C) 2025-2026 GoodData Corporation

import { type RefObject, useMemo, useRef } from "react";

import { useResponsiveTags } from "./hooks/useResponsiveTags.js";
import { useTagsInteractions } from "./interactions.js";
import { type IUiTagDef, type IUiTagsProps } from "./types.js";
import { UiTag } from "./UiTag.js";
import { type IAccessibilityConfigBase } from "../../typings/accessibility.js";
import { bem } from "../@utils/bem.js";
import { UiButton } from "../UiButton/UiButton.js";
import {
    type IUiComboboxOption,
    UiCombobox,
    UiComboboxInput,
    UiComboboxList,
    UiComboboxListItem,
    UiComboboxListItemCreatableLabel,
    UiComboboxListItemLabel,
    UiComboboxPopup,
} from "../UiCombobox/index.js";
import { UiPopover } from "../UiPopover/UiPopover.js";

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
    canDeleteTags = true,
    canCreateTag = true,
    readOnly = false,
    onTagClick = () => {},
    onTagAdd = () => {},
    onTagRemove = () => {},
    accessibilityConfig = defaultAccessibilityConfig,
}: IUiTagsProps) {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const expanded = mode === "multi-line";

    const isDeletable = canDeleteTags && !readOnly;
    const isAddable = canCreateTag && !readOnly;

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
    } = useResponsiveTags(tags, mode, [canCreateTag, canDeleteTags, readOnly]);

    const items = [...showedTags, hiddenTags];

    const {
        handleKeyDown,
        interactionState,
        onMoreOpen,
        onMoreClose,
        onAddOpen,
        onAddClose,
        showedFocusedIndex,
        hiddenFocusedIndex,
        tag,
        setTag,
        onTagClickHandler,
        onTagRemoveHandler,
        onTagAddHandler,
    } = useTagsInteractions(
        rootRef,
        tooltipTagsContainerRef,
        showedTags,
        hiddenTags,
        onTagClick,
        onTagAdd,
        onTagRemove,
    );

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
            tabIndex={tags.length === 0 ? -1 : 0}
            onKeyDown={handleKeyDown}
            className={b({ readOnly, mode })}
            aria-label={accessibilityConfig?.ariaLabel}
            aria-labelledby={accessibilityConfig?.ariaLabelledBy}
            aria-describedby={accessibilityConfig?.ariaDescribedBy}
            aria-expanded={accessibilityConfig?.ariaExpanded ?? expanded}
            role={accessibilityConfig?.role ?? "list"}
        >
            <div className={e("shadow-container")} ref={allContainerRef}>
                {tags.map((tag) => {
                    return (
                        <UiTag key={getKey(tag, isDeletable, readOnly)} tag={tag} isDeletable={isDeletable} />
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
                                role="listitem"
                                className={e("hidden-tags", { isFocused: showedFocusedIndex === i })}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                }}
                            >
                                {hiddenTags.length > 0 ? (
                                    <UiPopover
                                        onOpen={onMoreOpen}
                                        onClose={onMoreClose}
                                        enableFocusTrap
                                        initialFocus={tooltipTagsContainerRef as RefObject<HTMLElement>}
                                        returnFocusTo={rootRef as RefObject<HTMLElement>}
                                        anchor={
                                            <UiButton
                                                tabIndex={-1}
                                                label={`+${hiddenTags.length}`}
                                                size={"small"}
                                                variant={"tertiary"}
                                                ref={(ref) => {
                                                    hiddenTagsContainerRef.current = ref;
                                                    interactionState.current.more = ref;
                                                }}
                                            />
                                        }
                                        width={300}
                                        title={moreLabel}
                                        content={() => (
                                            <div
                                                onKeyDown={handleKeyDown}
                                                className={e("tags-more-tooltip")}
                                                ref={(ref) => {
                                                    tooltipTagsContainerRef.current = ref;
                                                    setTooltipContainer(ref);
                                                }}
                                                tabIndex={0}
                                            >
                                                {hiddenTags.map((tag, i) => {
                                                    return (
                                                        <UiTag
                                                            key={i}
                                                            tag={tag}
                                                            deleteLabel={removeLabel}
                                                            ref={(ref) => {
                                                                interactionState.current.tags[tag.id] = ref!;
                                                            }}
                                                            isDeletable={isDeletable}
                                                            isDisabled={readOnly}
                                                            isFocused={hiddenFocusedIndex === i}
                                                            maxWidth={tooltipWidth}
                                                            onDelete={onTagRemoveHandler}
                                                            onClick={onTagClickHandler}
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
                            ref={(ref) => {
                                interactionState.current.tags[tag.id] = ref!;
                            }}
                            isDeletable={isDeletable}
                            isDisabled={readOnly}
                            deleteLabel={removeLabel}
                            isFocused={showedFocusedIndex === i}
                            onDelete={onTagRemoveHandler}
                            onClick={onTagClickHandler}
                            key={getKey(tag, isDeletable, readOnly)}
                            maxWidth={i === showedTags.length - 1 ? lastAvailableWidth : availableWidth}
                        />
                    );
                })}
                {isAddable ? (
                    <div
                        className={e("add-button")}
                        ref={addButtonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <UiPopover
                            onOpen={onAddOpen}
                            onClose={() => {
                                setTag("");
                                onAddClose();
                            }}
                            enableFocusTrap
                            anchor={
                                <UiButton
                                    label={showedTags.length > 0 ? "" : addLabel}
                                    accessibilityConfig={{
                                        ariaLabel: showedTags.length > 0 ? addLabel : undefined,
                                    }}
                                    size={"small"}
                                    iconBefore={"plus"}
                                    variant={"tertiary"}
                                    ref={(ref) => {
                                        interactionState.current.add = ref;
                                    }}
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
                                        className={e("add-input")}
                                        aria-label={nameLabel}
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
                {!isAddable && tags.length === 0 ? (
                    <div className={e("empty-state")}>{noTagsLabel}</div>
                ) : null}
            </div>
        </div>
    );
}

function getKey(tag: IUiTagDef, isDeletable: boolean, readOnly: boolean) {
    return [tag.id, tag.isDeletable, isDeletable, readOnly].filter(Boolean).join("-");
}
