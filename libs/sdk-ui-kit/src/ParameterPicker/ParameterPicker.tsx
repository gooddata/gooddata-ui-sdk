// (C) 2026 GoodData Corporation

import { memo, useCallback, useDeferredValue, useMemo, useState } from "react";

import { defineMessages, useIntl } from "react-intl";

import { type IParameterMetadataObject, objRefToString } from "@gooddata/sdk-model";

import { bem } from "../@ui/@utils/bem.js";
import { UiButton } from "../@ui/UiButton/UiButton.js";
import { UiCheckbox } from "../@ui/UiCheckbox/UiCheckbox.js";
import { UiIcon } from "../@ui/UiIcon/UiIcon.js";
import { Input } from "../Form/Input.js";
import { LoadingSpinner } from "../LoadingSpinner/LoadingSpinner.js";

import { groupParametersByTag } from "./groupParametersByTag.js";

const { b, e } = bem("gd-ui-kit-parameter-picker");

const messages = defineMessages({
    empty: { id: "filter_bar_add_filter.parameters.empty" },
    noResults: { id: "filter_bar_add_filter.parameters.no_results" },
    searchPlaceholder: { id: "filter_bar_add_filter.parameters.search_placeholder" },
    add: { id: "filter_bar_add_filter.parameters.add" },
    cancel: { id: "cancel" },
    ungrouped: { id: "catalog.group_title.ungrouped" },
});

/**
 * @internal
 */
export interface IParameterPickerProps {
    parameters: ReadonlyArray<IParameterMetadataObject>;
    /**
     * Already-added parameter ref keys; matching items are omitted from the rendered list.
     */
    excludedKeys: ReadonlySet<string>;
    isLoading: boolean;
    maxListHeight: number;
    onAdd: (parameters: ReadonlyArray<IParameterMetadataObject>) => void;
    onCancel: () => void;
}

/**
 * Workspace-parameter catalog browser. Search, tag grouping, multi-select.
 * Already-added parameters (via `excludedKeys`) are omitted from the list.
 *
 * @internal
 */
export function ParameterPicker({
    parameters,
    excludedKeys,
    isLoading,
    maxListHeight,
    onAdd,
    onCancel,
}: IParameterPickerProps) {
    const intl = useIntl();

    const [search, setSearch] = useState("");
    const deferredSearch = useDeferredValue(search.trim());

    const [selectedKeys, setSelectedKeys] = useState<ReadonlySet<string>>(() => new Set());

    const collator = useMemo(() => new Intl.Collator(intl.locale), [intl.locale]);
    const ungroupedLabel = intl.formatMessage(messages.ungrouped);

    const groups = useMemo(() => {
        const needle = deferredSearch.toLowerCase();
        const offered = parameters.filter(
            (parameter) =>
                !excludedKeys.has(objRefToString(parameter.ref)) &&
                (!needle || parameter.title.toLowerCase().includes(needle)),
        );
        return groupParametersByTag(offered, ungroupedLabel, collator);
    }, [parameters, deferredSearch, ungroupedLabel, collator, excludedKeys]);

    const toggle = useCallback((key: string) => {
        setSelectedKeys((prev) => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
            } else {
                next.add(key);
            }
            return next;
        });
    }, []);

    const handleAdd = () => {
        onAdd(parameters.filter((parameter) => selectedKeys.has(objRefToString(parameter.ref))));
    };

    if (isLoading) {
        return (
            <div className={b()} data-testid="parameter-picker">
                <div className={e("loading")} data-testid="parameter-picker-loading">
                    <LoadingSpinner className="small" />
                </div>
            </div>
        );
    }

    return (
        <div className={b()} data-testid="parameter-picker">
            <div className={e("search")} data-testid="parameter-picker-search">
                <Input
                    value={search}
                    onChange={(value) => setSearch(String(value))}
                    placeholder={intl.formatMessage(messages.searchPlaceholder)}
                    autofocus
                    clearOnEsc
                    isSearch
                    isSmall
                />
            </div>
            {groups.length === 0 ? (
                <div className={e("empty")} data-testid="parameter-picker-empty">
                    {deferredSearch.length > 0
                        ? intl.formatMessage(messages.noResults)
                        : intl.formatMessage(messages.empty)}
                </div>
            ) : (
                <div className={e("list")} style={{ maxHeight: maxListHeight }}>
                    {groups.map((group) => (
                        <ParameterPickerGroup
                            key={group.tag}
                            tag={group.tag}
                            parameters={group.parameters}
                            selectedKeys={selectedKeys}
                            onToggle={toggle}
                        />
                    ))}
                </div>
            )}
            <div className={e("footer")}>
                <UiButton
                    variant="secondary"
                    size="small"
                    label={intl.formatMessage(messages.cancel)}
                    dataTestId="parameter-picker-cancel"
                    onClick={onCancel}
                />
                <UiButton
                    variant="primary"
                    size="small"
                    label={intl.formatMessage(messages.add)}
                    dataTestId="parameter-picker-add"
                    onClick={handleAdd}
                    isDisabled={selectedKeys.size === 0}
                />
            </div>
        </div>
    );
}

interface IParameterPickerGroupProps {
    tag: string;
    parameters: ReadonlyArray<IParameterMetadataObject>;
    selectedKeys: ReadonlySet<string>;
    onToggle: (key: string) => void;
}

function ParameterPickerGroup({ tag, parameters, selectedKeys, onToggle }: IParameterPickerGroupProps) {
    return (
        <div className={e("group")}>
            <div className={e("group-header")}>{tag}</div>
            <ul className={e("items")}>
                {parameters.map((parameter) => {
                    const key = objRefToString(parameter.ref);
                    return (
                        <ParameterPickerRow
                            key={key}
                            rowKey={key}
                            title={parameter.title}
                            isSelected={selectedKeys.has(key)}
                            onToggle={onToggle}
                        />
                    );
                })}
            </ul>
        </div>
    );
}

interface IParameterPickerRowProps {
    rowKey: string;
    title: string;
    isSelected: boolean;
    onToggle: (key: string) => void;
}

const ParameterPickerRow = memo(function ParameterPickerRow({
    rowKey,
    title,
    isSelected,
    onToggle,
}: IParameterPickerRowProps) {
    return (
        <li className={e("item")} data-testid="parameter-picker-item">
            <label className={e("item-label")}>
                <UiCheckbox checked={isSelected} onChange={() => onToggle(rowKey)} />
                <span className={e("item-icon")}>
                    <UiIcon type="parameter" size={18} color="currentColor" />
                </span>
                <span className={e("item-title")}>{title}</span>
            </label>
        </li>
    );
});
