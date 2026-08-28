// (C) 2007-2026 GoodData Corporation

import { Children, type ReactNode, useMemo } from "react";

import { FormattedMessage, useIntl } from "react-intl";

import { UiTooltip } from "../../@ui/UiTooltip/UiTooltip.js";

/**
 * @internal
 */
export interface IInvertableSelectStatusProps<T> {
    isInverted: boolean;
    selectedItems: T[];
    getItemTitle: (item: T) => string;
}

/**
 * @internal
 */
export function useInvertableSelectionStatusText<T>(
    selectedItems: T[],
    isInverted: boolean,
    getItemTitle: (item: T) => string,
): { text: string; count: number | undefined; whole: string } {
    const intl = useIntl();

    const isSelectionEmpty = selectedItems.length === 0;
    const isAll = isSelectionEmpty && isInverted;
    const isNone = isSelectionEmpty && !isInverted;
    const isAllExcept = !isSelectionEmpty && isInverted;

    const selectionString = useMemo(() => {
        return selectedItems.map((selectedItem) => getItemTitle(selectedItem)).join(", ");
    }, [selectedItems, getItemTitle]);

    const stringChunks = [];
    if (isAll) {
        stringChunks.push(intl.formatMessage({ id: "gs.list.all" }));
    }
    if (isNone) {
        stringChunks.push(intl.formatMessage({ id: "gs.filterLabel.none" }));
    }
    if (isAllExcept) {
        stringChunks.push(intl.formatMessage({ id: "gs.list.isNot" }));
    }

    let count = undefined;
    const selectedChunks = stringChunks.slice();
    if (!isAll && !isSelectionEmpty) {
        stringChunks.push(selectionString, `(${selectedItems.length})`);
        selectedChunks.push(selectionString);
        count = selectedItems.length;
    }

    return {
        count,
        text: selectedChunks.join(" "),
        whole: stringChunks.join(" "),
    };
}

/**
 * The status bar is a flex container whose spacing comes from non-breaking spaces (see
 * invertableSelect.scss), so every part of the message has to be its own element. The `label` tag
 * renders the connective words with that spacing around them, while anything a translation leaves
 * outside a tag is wrapped by {@link renderStatusChunks} without any spacing added - that is what
 * lets one message read "is All" in English and "すべてを選択中" in Japanese.
 *
 * Each tag occurs at most once per message, so a constant key is enough to keep React quiet about
 * the chunk array react-intl builds.
 */
const labelChunks = (chunks: ReactNode) => (
    <span key="label">
        {" "}
        {chunks}
        {" "}
    </span>
);

const boldChunks = (chunks: ReactNode) => <b key="value">{chunks}</b>;

function renderStatusChunks(chunks: ReactNode[]): ReactNode {
    // Children.toArray flattens the nested chunks react-intl hands over and keys the elements.
    return Children.toArray(chunks).map((chunk, index) =>
        typeof chunk === "string" ? <span key={index}>{chunk.replaceAll(" ", " ")}</span> : chunk,
    );
}

/**
 * @internal
 */
export function InvertableSelectStatus<T>({
    selectedItems,
    getItemTitle,
    isInverted,
}: IInvertableSelectStatusProps<T>) {
    const isSelectionEmpty = selectedItems.length === 0;
    const isAll = isSelectionEmpty && isInverted;
    const isNone = isSelectionEmpty && !isInverted;
    const isAllExcept = !isSelectionEmpty && isInverted;

    const selectionString = useMemo(() => {
        return selectedItems.map((selectedItem) => getItemTitle(selectedItem)).join(", ");
    }, [selectedItems, getItemTitle]);

    if (isAll) {
        return (
            <FormattedMessage id="gs.list.selectionStatus.all" values={{ label: labelChunks, b: boldChunks }}>
                {(...chunks) => <>{renderStatusChunks(chunks)}</>}
            </FormattedMessage>
        );
    }

    if (isNone) {
        return (
            <FormattedMessage
                id="gs.list.selectionStatus.none"
                values={{ label: labelChunks, b: boldChunks }}
            >
                {(...chunks) => <>{renderStatusChunks(chunks)}</>}
            </FormattedMessage>
        );
    }

    const selection = (
        <UiTooltip
            arrowPlacement="top-start"
            triggerBy={["hover"]}
            content={selectionString}
            anchor={
                <>
                    <span className="gd-shortened-text gd-selection-list s-dropdown-attribute-selection-list">
                        {selectionString}
                    </span>
                    {`\xa0(${selectedItems.length})`}
                </>
            }
        />
    );

    return isAllExcept ? (
        <FormattedMessage
            id="gs.list.selectionStatus.isNot"
            values={{ selection, label: labelChunks, b: boldChunks }}
        >
            {(...chunks) => <>{renderStatusChunks(chunks)}</>}
        </FormattedMessage>
    ) : (
        <FormattedMessage
            id="gs.list.selectionStatus.is"
            values={{ selection, label: labelChunks, b: boldChunks }}
        >
            {(...chunks) => <>{renderStatusChunks(chunks)}</>}
        </FormattedMessage>
    );
}
