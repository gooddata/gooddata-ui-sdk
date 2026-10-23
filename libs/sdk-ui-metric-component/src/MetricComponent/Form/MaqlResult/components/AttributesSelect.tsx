// (C) 2022-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback, useMemo, useState } from "react";

import classNames from "classnames";
import { debounce, isEqual } from "lodash-es";
import { defineMessages, useIntl } from "react-intl";

import { type ICatalogAttribute } from "@gooddata/sdk-model";
import { LoadingComponent } from "@gooddata/sdk-ui";
import { Button, Dropdown, DropdownList, type IDropdownButtonRenderProps } from "@gooddata/sdk-ui-kit";

import { useProp } from "../../../../shared/hooks/useProp.js";
import { type DefaultTheme, makeStyles } from "../../../../shared/theme/index.js";

import { AttributeDropdownListItem } from "./AttributesSelectItem.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {},
    header: {
        lineHeight: "11px",
        fontSize: "11px",
        textTransform: "uppercase",
        padding: 10,
        color: theme.globals.colors.defaultStateBlank,
        background: theme.globals.colors.dropdownHeaderBackground,
    },
    line: {
        height: 1,
        background: theme.globals.colors.defaultBorderDarker,
        margin: "0 10px",
    },
    unrelated: {
        fontSize: "12px",
        padding: "5px 10px",
        color: theme.globals.colors.defaultStateBlank,
    },
    list: {},
    dropdown: {
        position: "relative",
    },
    dropdownItem: {
        position: "relative",
        height: "100%",
        display: "flex",

        "& > span": {
            zIndex: 9,
            flex: "0 0 auto",
            display: "block",
            marginRight: "-25px",
            width: "25px",
            textAlign: "right",
            fontSize: "12px",
            fontWeight: "bold",
        },

        "& > div": {
            flex: "1 1 auto",
            paddingLeft: "30px",
        },
    },
    buttons: {
        display: "flex",
        margin: "10px",
        justifyContent: "flex-end",
    },
    loading: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100,
        background: "white",
    },
}));

export type IAttributesSelectProps = {
    opener: (props: IDropdownButtonRenderProps) => ReactNode;
    loading?: boolean;
    all?: ICatalogAttribute[];
    attributes?: ICatalogAttribute[];
    preselected?: ICatalogAttribute[];
    onApply?: (attrs: ICatalogAttribute[]) => void;
    onCancel?: () => void;
    onOpen?: () => void;
};

const messages = defineMessages({
    context: {
        id: "metricComponent.editMetric.metric.result.context",
    },
    unrelated: {
        id: "metricComponent.editMetric.metric.result.context.unrelated",
    },
});

export function AttributesSelect({
    all = [],
    attributes = [],
    preselected = [],
    loading,
    opener,
    onApply,
    onCancel,
    onOpen,
}: IAttributesSelectProps): ReactElement {
    const intl = useIntl();
    const { cx, classes } = useStyles();

    const { items, search, onSearch } = useSearch(attributes);
    const { selected, changed, toggleSelected, resetSelected } = useSelected(preselected);
    const sorted = useSorted(items, selected);
    const { onStateChangeHandler, onApplyHandler, onCancelHandler } = useCallbacks(
        selected,
        resetSelected,
        onApply,
        onCancel,
        onOpen,
    );

    return (
        <Dropdown
            closeOnParentScroll
            closeOnMouseDrag
            closeOnOutsideClick
            className={classes.root}
            alignPoints={[{ align: "tr br" }, { align: "tr tr" }, { align: "cr cl" }]}
            renderButton={opener}
            onOpenStateChanged={onStateChangeHandler}
            renderBody={({ closeDropdown }) => (
                <div className={classes.list}>
                    <div className={classes.header}>{intl.formatMessage(messages.context)}</div>
                    <div className={classes.dropdown}>
                        {loading && <LoadingComponent className={cx("large", classes.loading)} />}
                        <DropdownList
                            items={sorted}
                            searchFieldSize="small"
                            showSearch
                            onSearch={onSearch}
                            searchString={search}
                            searchPlaceholder={intl.formatMessage({
                                id: "metricComponent.editMetric.metric.context.search",
                            })}
                            renderItem={(props) => {
                                const isSelected = !!selected?.includes(props.item);
                                return (
                                    <div className={classes.dropdownItem}>
                                        {isSelected && <span>{selected.indexOf(props.item) + 1}.</span>}
                                        <AttributeDropdownListItem
                                            {...props}
                                            selected={isSelected}
                                            onSelect={toggleSelected}
                                        />
                                    </div>
                                );
                            }}
                        />
                    </div>
                    {all.length > attributes.length && (
                        <>
                            <div className={classes.line} />
                            <div className={classes.unrelated}>
                                {intl.formatMessage(messages.unrelated, {
                                    unrelated: all.length - attributes.length,
                                })}
                            </div>
                        </>
                    )}
                    <div className={classes.line} />
                    <div className={classes.buttons}>
                        <Button
                            disabled={loading}
                            value={intl.formatMessage({
                                id: "metricComponent.editMetric.metric.context.cancel",
                            })}
                            onClick={() => {
                                onCancelHandler();
                                closeDropdown();
                            }}
                            className={classNames("gd-button-secondary", "s-button-cancel")}
                        />
                        <Button
                            value={intl.formatMessage({
                                id: "metricComponent.editMetric.metric.context.apply",
                            })}
                            onClick={() => {
                                onApplyHandler();
                                closeDropdown();
                            }}
                            disabled={!changed}
                            className={classNames(
                                "gd-button-action",
                                "s-button-apply",
                                !changed && "disabled",
                            )}
                        />
                    </div>
                </div>
            )}
        />
    );
}

function useSearch(attributes: ICatalogAttribute[]) {
    const [search, setSearch] = useState("");

    // oxlint-disable-next-line react-hooks/exhaustive-deps
    const onSearch = useCallback(
        debounce((query: string) => {
            setSearch(query);
        }, 250),
        [],
    );

    const items = useMemo(
        () =>
            search
                ? attributes.filter((a) => a.attribute.title.toLowerCase().includes(search.toLowerCase()))
                : attributes,
        [attributes, search],
    );

    return {
        onSearch,
        search,
        items,
    };
}

function useSelected(preselected: ICatalogAttribute[]) {
    const [selected, setSelected] = useProp(preselected);

    const changed = useMemo(
        () => !isEqual(selected.slice().sort(), preselected.slice().sort()),
        [preselected, selected],
    );

    const toggleSelected = useCallback(
        (attr: ICatalogAttribute) => {
            if (selected.includes(attr)) {
                setSelected(selected.filter((attribute) => attr !== attribute));
            } else {
                setSelected([...selected, attr]);
            }
        },
        [selected, setSelected],
    );

    const resetSelected = useCallback(() => {
        setSelected(preselected);
    }, [preselected, setSelected]);

    return {
        changed,
        selected,
        toggleSelected,
        resetSelected,
    };
}

function useSorted(attributes: ICatalogAttribute[], selected: ICatalogAttribute[]) {
    return useMemo(() => {
        return [...selected, ...attributes.filter((a) => !selected.includes(a))];
    }, [attributes, selected]);
}

function useCallbacks(
    selected: ICatalogAttribute[],
    resetSelected: () => void,
    onApply?: (attrs: ICatalogAttribute[]) => void,
    onCancel?: () => void,
    onOpen?: () => void,
) {
    const onCancelHandler = useCallback(() => {
        resetSelected();
        if (onCancel) {
            onCancel();
        }
    }, [resetSelected, onCancel]);

    const onOpenHandler = useCallback(() => {
        if (onOpen) {
            onOpen();
        }
    }, [onOpen]);

    const onApplyHandler = useCallback(() => onApply?.(selected), [selected, onApply]);

    const onStateChangeHandler = useCallback(
        (isOpen: boolean) => {
            if (isOpen) {
                onOpenHandler();
            } else {
                onCancelHandler();
            }
        },
        [onCancelHandler, onOpenHandler],
    );

    return {
        onStateChangeHandler,
        onApplyHandler,
        onCancelHandler,
    };
}
