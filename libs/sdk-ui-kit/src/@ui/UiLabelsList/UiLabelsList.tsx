// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { olpLabelMessages } from "../../locales.js";
import { bem } from "../@utils/bem.js";
import { type LabelRowKind, UiLabelRow } from "../UiLabelRow/UiLabelRow.js";

const { b, e } = bem("gd-ui-kit-labels-list");

/**
 * One label entry in the list.
 *
 * @internal
 */
export interface IUiLabelsListItem {
    /** Stable identifier for React keys. */
    id: string;
    /** Label text. */
    label: string;
    /** Drives the icon + suffix. Omit for a regular label. */
    kind?: LabelRowKind;
}

/**
 * @internal
 */
export interface IUiLabelsListProps {
    /** Label items to render in source order. */
    items: ReadonlyArray<IUiLabelsListItem>;
    /** Test id forwarded to the root element. */
    dataTestId?: string;
}

/**
 * Read-only list of labels — uppercase heading + N `UiLabelRow`s.
 * Renders only the panel content; whoever needs a popover wraps it.
 *
 * @internal
 */
export function UiLabelsList({ items, dataTestId }: IUiLabelsListProps) {
    const intl = useIntl();
    const suffixFor = (kind: LabelRowKind | undefined) => {
        if (!kind) return undefined;
        return intl.formatMessage(
            kind === "primary" ? olpLabelMessages.suffixPrimary : olpLabelMessages.suffixDefault,
        );
    };
    return (
        <div className={b()} data-testid={dataTestId}>
            <div className={e("heading")}>{intl.formatMessage(olpLabelMessages.listHeading)}</div>
            <div className={e("items")} role="list">
                {items.map((item) => (
                    <div key={item.id} role="listitem">
                        <UiLabelRow label={item.label} kind={item.kind} suffix={suffixFor(item.kind)} />
                    </div>
                ))}
            </div>
        </div>
    );
}
