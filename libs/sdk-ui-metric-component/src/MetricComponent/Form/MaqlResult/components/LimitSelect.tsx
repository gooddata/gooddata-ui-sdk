// (C) 2022-2026 GoodData Corporation

import { type ReactElement, type ReactNode, useCallback, useMemo } from "react";

import classNames from "classnames";
import { isEqual } from "lodash-es";
import { FormattedMessage, useIntl } from "react-intl";

import {
    Button,
    Dropdown,
    DropdownButton,
    DropdownList,
    type IDropdownButtonRenderProps,
    SingleSelectListItem,
} from "@gooddata/sdk-ui-kit";

import { useProp } from "../../../../shared/hooks/useProp.js";
import { type DefaultTheme, makeStyles } from "../../../../shared/theme/index.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    root: {
        display: "flex",
    },
    dropdown: {
        display: "flex",
    },
    filter: {
        margin: 10,
        gap: 10,
        display: "flex",
        color: theme.globals.colors.defaultText,
        fontSize: "12px",
    },
    rows: {
        display: "flex",
        alignItems: "center",
        marginRight: 20,
    },
    title: {
        display: "flex",
        alignItems: "center",
        fontSize: "12px",
        color: theme.globals.colors.defaultGreyedText,
    },
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
    list: {},
    buttons: {
        display: "flex",
        margin: "10px",
        justifyContent: "flex-end",
    },
}));

export type ILimitSelectProps = {
    opener: (props: IDropdownButtonRenderProps) => ReactNode;
    limit?: 10 | 100 | 1000 | 10000;
    ranking?: "top" | "bottom";
    onApply?: (limit: 10 | 100 | 1000 | 10000, ranking: "top" | "bottom") => void;
    onCancel?: () => void;
};

export function LimitSelect({
    ranking = "top",
    limit = 10,
    opener,
    onApply,
    onCancel,
}: ILimitSelectProps): ReactElement {
    const intl = useIntl();
    const { cx, classes } = useStyles();

    const { selectedLimit, selectedRanking, resetSelected, changed, setRanking, setLimit } = useSelected(
        limit,
        ranking,
    );
    const { onStateChangeHandler, onApplyHandler, onCancelHandler } = useCallbacks(
        selectedLimit,
        selectedRanking,
        resetSelected,
        onApply,
        onCancel,
    );

    return (
        <div className={cx(classes.root)}>
            <label className={cx(classes.title)}>
                <FormattedMessage id="metricComponent.editMetric.metric.result.context.displayTitle" />:
            </label>
            <Dropdown
                closeOnParentScroll
                closeOnMouseDrag
                closeOnOutsideClick
                className={classes.dropdown}
                alignPoints={[{ align: "tr br" }]}
                renderButton={opener}
                onOpenStateChanged={onStateChangeHandler}
                renderBody={({ closeDropdown }) => (
                    <div className={classes.list}>
                        <div className={classes.header}>
                            <FormattedMessage id="metricComponent.editMetric.metric.result.context.displayTitle" />
                        </div>
                        <div className={classes.filter}>
                            <SimpleSelect
                                items={[
                                    {
                                        label: intl.formatMessage({
                                            id: "metricComponent.editMetric.metric.result.context.displayTop",
                                        }),
                                        value: "top",
                                    },
                                    {
                                        label: intl.formatMessage({
                                            id: "metricComponent.editMetric.metric.result.context.displayBottom",
                                        }),
                                        value: "bottom",
                                    },
                                ]}
                                selected={selectedRanking}
                                onSelect={(sel: "top" | "bottom") => setRanking(sel)}
                            />
                            <SimpleSelect
                                items={[
                                    { label: "10", value: 10 },
                                    { label: "100", value: 100 },
                                    { label: "1 000", value: 1000 },
                                    { label: "10 000", value: 10000 },
                                ]}
                                selected={selectedLimit}
                                onSelect={(sel: 10 | 100 | 1000 | 10000) => setLimit(sel)}
                            />
                            <div className={classes.rows}>
                                <FormattedMessage id="metricComponent.editMetric.metric.result.context.displayRows" />
                            </div>
                        </div>
                        <div className={classes.filter}>
                            <FormattedMessage id="metricComponent.editMetric.metric.result.context.display.explain" />
                        </div>
                        <div className={classes.line} />
                        <div className={classes.buttons}>
                            <Button
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
        </div>
    );
}

type ISimpleSelectProps<T> = {
    items: Array<{ label: string; value: T }>;
    selected?: T;
    onSelect?: (value: T) => void;
};

function SimpleSelect<T>({ items, selected, onSelect }: ISimpleSelectProps<T>) {
    const selectedItem = items.find((item) => item.value === selected);

    return (
        <Dropdown
            renderBody={({ isMobile, closeDropdown }) => (
                <DropdownList
                    width={150}
                    items={items}
                    isMobile={isMobile}
                    renderItem={({ item }) => (
                        <SingleSelectListItem
                            title={item.label}
                            isSelected={item.value === selectedItem?.value}
                            onClick={() => {
                                if (onSelect) {
                                    onSelect(item.value);
                                }
                                closeDropdown();
                            }}
                        />
                    )}
                />
            )}
            renderButton={({ openDropdown, isOpen }) => (
                <DropdownButton value={selectedItem?.label} isOpen={isOpen} onClick={openDropdown} />
            )}
        />
    );
}

function useSelected(preselectedLimit: 10 | 100 | 1000 | 10000, preselectedRanking: "top" | "bottom") {
    const [selectedLimit, setLimit] = useProp(preselectedLimit);
    const [selectedRanking, setRanking] = useProp(preselectedRanking);

    const changed = useMemo(
        () => !isEqual(selectedLimit, preselectedLimit) || !isEqual(selectedRanking, preselectedRanking),
        [preselectedLimit, preselectedRanking, selectedLimit, selectedRanking],
    );

    const resetSelected = useCallback(() => {
        setLimit(preselectedLimit);
        setRanking(preselectedRanking);
    }, [preselectedLimit, preselectedRanking, setLimit, setRanking]);

    return {
        changed,
        selectedLimit,
        setLimit,
        selectedRanking,
        setRanking,
        resetSelected,
    };
}

function useCallbacks(
    selectedLimit: 10 | 100 | 1000 | 10000,
    selectedRanking: "top" | "bottom",
    resetSelected: () => void,
    onApply?: (limit: 10 | 100 | 1000 | 10000, ranking: "top" | "bottom") => void,
    onCancel?: () => void,
) {
    const onCancelHandler = useCallback(() => {
        resetSelected();
        if (onCancel) {
            onCancel();
        }
    }, [resetSelected, onCancel]);

    const onApplyHandler = useCallback(
        () => onApply?.(selectedLimit, selectedRanking),
        [onApply, selectedLimit, selectedRanking],
    );

    const onStateChangeHandler = useCallback(
        (isOpen: boolean) => {
            if (!isOpen) {
                onCancelHandler();
            }
        },
        [onCancelHandler],
    );

    return {
        onStateChangeHandler,
        onApplyHandler,
        onCancelHandler,
    };
}
