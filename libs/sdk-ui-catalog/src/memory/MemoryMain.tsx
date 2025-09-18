// (C) 2025 GoodData Corporation

import { useCallback, useEffect, useMemo, useState } from "react";

import { useIntl } from "react-intl";

import type { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";
import type { IGenAIMemoryItem, IGenAIMemoryItemCreate } from "@gooddata/sdk-model";
import {
    Button,
    Dialog,
    Dropdown,
    DropdownButton,
    DropdownList,
    UiAsyncTable,
    type UiAsyncTableColumn,
    UiAsyncTableEmptyState,
    UiAsyncTableRowHeightNormal,
    UiAsyncTableScrollbarWidth,
    useElementSize,
} from "@gooddata/sdk-ui-kit";

import { GroupLayout } from "../main/GroupLayout.js";

type MemoryService = ReturnType<IAnalyticalBackend["workspace"]>["genAI"] extends () => unknown
    ? ReturnType<ReturnType<ReturnType<IAnalyticalBackend["workspace"]>["genAI"]>["getMemory"]>
    : never;

type Props = {
    backend: IAnalyticalBackend;
    workspace: string;
};

const tableWidth = 1100;

export function MemoryMain({ backend, workspace }: Props) {
    const intl = useIntl();
    const [items, setItems] = useState<IGenAIMemoryItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [_error, setError] = useState<string | null>(null);

    const memory = useMemo(() => backend.workspace(workspace).genAI().getMemory(), [backend, workspace]);
    const { ref, height, width } = useElementSize<HTMLDivElement>();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<IGenAIMemoryItemCreate>({
        instruction: "",
        keywords: [],
        type: "INSTRUCTION",
    });

    const reload = useCallback(() => {
        setLoading(true);
        setError(null);
        memory
            .list()
            .then(setItems)
            .catch((e) => setError(`${e.name} ${e.message}`))
            .finally(() => setLoading(false));
    }, [memory]);

    useEffect(() => {
        reload();
    }, [memory, reload]);

    const availableWidth = (width > 0 ? width : tableWidth) - UiAsyncTableScrollbarWidth;

    const columns: UiAsyncTableColumn<IGenAIMemoryItem & { id: string }>[] = useMemo(() => {
        return [
            {
                width: getColumnWidth(availableWidth, 400),
                key: "instruction",
                bold: true,
                label: intl.formatMessage({ id: "analyticsCatalog.memory.column.instruction.label" }),
                getTextContent: (item) => item.instruction,
                getTextTitle: (item) => item.instruction,
            },
            {
                width: getColumnWidth(availableWidth, 150),
                key: "type",
                label: intl.formatMessage({ id: "analyticsCatalog.memory.column.type.label" }),
                getTextContent: (item) => item.type,
                getTextTitle: (item) => item.type,
            },
            {
                width: getColumnWidth(availableWidth, 300),
                key: "keywords",
                label: intl.formatMessage({ id: "analyticsCatalog.memory.column.keywords.label" }),
                getTextContent: (item) => (item.keywords || []).join(", "),
                getTextTitle: (item) => (item.keywords || []).join(", "),
            },
            {
                width: getColumnWidth(availableWidth, 180),
                label: intl.formatMessage({ id: "analyticsCatalog.memory.column.actions.label" }),
                renderButton: (item: IGenAIMemoryItem & { id: string }) => (
                    <div className="gd-analytics-catalog__memory-actions">
                        <Button
                            onClick={() => {
                                setEditingId(item.id);
                                setForm({
                                    instruction: item.instruction,
                                    type: item.type,
                                    keywords: item.keywords || [],
                                });
                                setIsDialogOpen(true);
                            }}
                            className="gd-button-secondary gd-button-small"
                            value="Edit"
                        />
                        <Button
                            onClick={async () => {
                                if (confirm("Delete this memory item?")) {
                                    try {
                                        await remove(memory, item.id);
                                        reload();
                                    } catch {
                                        // Error already handled in remove function
                                    }
                                }
                            }}
                            className="gd-button-negative gd-button-small"
                            value="Delete"
                        />
                    </div>
                ),
            },
        ];
    }, [intl, availableWidth, memory, reload]);

    const effectiveItems = useMemo(() => items.map((item) => ({ ...item, id: item.id })), [items]);

    return (
        <section className="gd-analytics-catalog__main">
            <header>
                <GroupLayout title={<span>Memory Items</span>}>
                    <div />
                </GroupLayout>
            </header>
            <div>
                <MemoryToolbar
                    onRefresh={reload}
                    onCreate={() => {
                        setEditingId(null);
                        setForm({ instruction: "", keywords: [], type: "INSTRUCTION" });
                        setIsDialogOpen(true);
                    }}
                />
                <div className="gd-analytics-catalog__table" ref={ref}>
                    <UiAsyncTable<IGenAIMemoryItem & { id: string }>
                        totalItemsCount={items.length}
                        skeletonItemsCount={loading ? 3 : 0}
                        items={effectiveItems}
                        columns={columns}
                        maxHeight={height - UiAsyncTableRowHeightNormal}
                        isLoading={loading}
                        hasNextPage={false}
                        loadNextPage={async () => {}}
                        renderEmptyState={() => (
                            <UiAsyncTableEmptyState
                                icon="drawerEmpty"
                                title={intl.formatMessage({ id: "analyticsCatalog.memory.empty.title" })}
                                description={intl.formatMessage({
                                    id: "analyticsCatalog.memory.empty.description",
                                })}
                            />
                        )}
                    />
                </div>
                {isDialogOpen ? (
                    <MemoryFormDialog
                        title={editingId ? "Edit memory item" : "Create memory item"}
                        form={form}
                        onChange={setForm}
                        onCancel={() => setIsDialogOpen(false)}
                        onSubmit={async () => {
                            if (!form.instruction.trim()) {
                                alert("Instruction is required");
                                return;
                            }
                            try {
                                if (editingId) {
                                    await update(memory, editingId, form);
                                } else {
                                    await create(memory, form);
                                }
                                reload(); // Refresh the list after successful operation
                                setIsDialogOpen(false);
                            } catch {
                                // Error already handled in create/update functions
                                // Dialog stays open so user can retry
                            }
                        }}
                    />
                ) : null}
            </div>
        </section>
    );
}

async function create(memory: MemoryService, data: IGenAIMemoryItemCreate): Promise<IGenAIMemoryItem> {
    try {
        return await memory.create(data);
    } catch (error) {
        alert(`Failed to create memory item: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

async function update(
    memory: MemoryService,
    id: string,
    data: IGenAIMemoryItemCreate,
): Promise<IGenAIMemoryItem> {
    try {
        return await memory.update(id, data);
    } catch (error) {
        alert(`Failed to update memory item: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

async function remove(memory: MemoryService, id: string): Promise<void> {
    try {
        await memory.remove(id);
    } catch (error) {
        alert(`Failed to delete memory item: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

function getColumnWidth(availableWidth: number, desiredWidth: number) {
    return Math.round((availableWidth * desiredWidth) / tableWidth);
}

type MemoryToolbarProps = {
    onRefresh: () => void;
    onCreate: () => void;
};

function MemoryToolbar({ onRefresh, onCreate }: MemoryToolbarProps) {
    return (
        <div className="gd-analytics-catalog__memory-toolbar">
            <Button onClick={onRefresh} className="gd-button-secondary" value="Refresh" />
            <Button onClick={onCreate} className="gd-button-action" value="New" />
        </div>
    );
}

type MemoryFormDialogProps = {
    title: string;
    form: IGenAIMemoryItemCreate;
    onChange: (f: IGenAIMemoryItemCreate) => void;
    onCancel: () => void;
    onSubmit: () => void;
};

function MemoryFormDialog({ title, form, onChange, onCancel, onSubmit }: MemoryFormDialogProps) {
    const [keywordsInput, setKeywordsInput] = useState((form.keywords || []).join(", "));

    const typeOptions = [
        { id: "INSTRUCTION", title: "INSTRUCTION" },
        { id: "SYNONYM", title: "SYNONYM" },
        { id: "ABBREVIATION", title: "ABBREVIATION" },
    ];

    const selectedTypeOption = typeOptions.find((option) => option.id === form.type);

    // Update input when form changes (e.g., when editing different items)
    useEffect(() => {
        setKeywordsInput((form.keywords || []).join(", "));
    }, [form.keywords]);

    const handleKeywordsChange = (value: string) => {
        setKeywordsInput(value);
    };

    const processKeywords = () => {
        const keywords = keywordsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        onChange({ ...form, keywords });
        return keywords;
    };

    const handleKeywordsBlur = () => {
        processKeywords();
    };

    const handleSubmit = () => {
        // Ensure keywords are processed before submitting
        processKeywords();
        onSubmit();
    };

    return (
        <Dialog
            displayCloseButton
            accessibilityConfig={{ title: title, isModal: true }}
            onClose={onCancel}
            onCancel={onCancel}
            onSubmit={handleSubmit}
            submitOnEnterKey
            className="gd-memory-dialog"
        >
            <div className="gd-dialog-header-wrapper">
                <div className="gd-dialog-header">
                    <h3 className="gd-dialog-header-title">{title}</h3>
                </div>
            </div>

            <div className="gd-dialog-content">
                <form className="gd-memory-dialog-form" onSubmit={(e) => e.preventDefault()}>
                    <label className="gd-memory-dialog-form-input">
                        Instruction *
                        <textarea
                            id="memory-instruction"
                            className="gd-input-field s-textarea-field"
                            value={form.instruction}
                            onChange={(e) => onChange({ ...form, instruction: e.target.value })}
                            placeholder="Enter the instruction text..."
                            rows={3}
                            required
                        />
                    </label>

                    <label className="gd-memory-dialog-form-select">
                        Type
                        <div className="gd-memory-dialog-form-select-wrapper">
                            <Dropdown
                                alignPoints={[{ align: "bl tl" }]}
                                renderButton={({ toggleDropdown, isOpen }) => (
                                    <DropdownButton
                                        value={selectedTypeOption?.title || "Select type"}
                                        onClick={toggleDropdown}
                                        isOpen={isOpen}
                                    />
                                )}
                                renderBody={({ closeDropdown }) => (
                                    <DropdownList
                                        items={typeOptions}
                                        itemsCount={typeOptions.length}
                                        renderItem={({ item }) => (
                                            <div
                                                className="gd-list-item s-list-item"
                                                onClick={() => {
                                                    onChange({
                                                        ...form,
                                                        type: item.id as IGenAIMemoryItemCreate["type"],
                                                    });
                                                    closeDropdown();
                                                }}
                                            >
                                                {item.title}
                                            </div>
                                        )}
                                        closeDropdown={closeDropdown}
                                    />
                                )}
                            />
                        </div>
                    </label>

                    <label className="gd-memory-dialog-form-input">
                        Keywords
                        <input
                            id="memory-keywords"
                            className="gd-input-field s-input-field"
                            type="text"
                            value={keywordsInput}
                            onChange={(e) => handleKeywordsChange(e.target.value)}
                            onBlur={handleKeywordsBlur}
                            placeholder="keyword1, keyword2, keyword3"
                        />
                    </label>
                </form>
            </div>

            <div className="gd-dialog-footer">
                <Button
                    onClick={onCancel}
                    className="gd-button-secondary s-dialog-cancel-button"
                    value="Cancel"
                />
                <Button
                    onClick={handleSubmit}
                    className="gd-button-action s-dialog-submit-button"
                    value="Save"
                />
            </div>
        </Dialog>
    );
}
