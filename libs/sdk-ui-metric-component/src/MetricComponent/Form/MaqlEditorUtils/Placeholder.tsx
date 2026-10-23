// (C) 2021-2026 GoodData Corporation

import { type CSSProperties, type MutableRefObject, useEffect, useRef, useState } from "react";

import { FormattedMessage } from "react-intl";

import { isMac } from "../../../shared/platform.js";
import { type DefaultTheme, makeStyles } from "../../../shared/theme/index.js";

const useStyles = makeStyles()((theme: DefaultTheme) => ({
    placeHolder: {
        background: "transparent",
        position: "absolute",
        zIndex: 5001,
        fontSize: "14px",
        lineHeight: "22px",
        color: theme.globals.colors.placeholder,
        fontFamily: theme.fonts.placeholder,
        pointerEvents: "none",

        ".metricComponent-editMetric-placeholder": {
            color: theme.globals.colors.maqlKeyword,
        },
    },
}));

interface IPlaceholderProps {
    visible: boolean;
    selector: string;
    readonly?: boolean;
}

export function Placeholder({ visible, readonly, selector }: IPlaceholderProps) {
    const element = useRef<HTMLDivElement | null>(null);
    const { classes, cx } = useStyles();

    const selected = useSelectedElement(element, selector, visible);
    const style = useSelectorPosition(element, selected);

    if (!visible) {
        return null;
    }

    return (
        <div className={cx(classes.placeHolder, "s-editor-placeholder")} ref={element} style={style}>
            {readonly ? (
                <FormattedMessage id="metricComponent.editMetric.placeholder.readOnly" />
            ) : isMac() ? (
                <FormattedMessage
                    id="metricComponent.editMetric.placeholderMac"
                    values={{
                        placeholder: (chunk) => (
                            <span className="metricComponent-editMetric-placeholder">{chunk}</span>
                        ),
                    }}
                />
            ) : (
                <FormattedMessage
                    id="metricComponent.editMetric.placeholder"
                    values={{
                        placeholder: (chunk) => (
                            <span className="metricComponent-editMetric-placeholder">{chunk}</span>
                        ),
                    }}
                />
            )}
        </div>
    );
}

function useSelectedElement(
    ref: MutableRefObject<HTMLDivElement | null>,
    selector: string,
    visible: boolean,
) {
    const element = ref.current;
    const parent = element?.parentElement;
    const [selected, setSelected] = useState<HTMLElement | null>(null);

    useEffect(() => {
        if (!visible || !parent) {
            setSelected(null);
            return;
        }

        if (selected) {
            return;
        }

        const timer = window.setTimeout(
            () => setSelected(parent && (parent.querySelector(selector) as HTMLElement)),
            10,
        );
        return () => window.clearTimeout(timer);
    }, [parent, selected, selector, visible]);

    return selected;
}

function useSelectorPosition(
    ref: MutableRefObject<HTMLDivElement | null>,
    selected: HTMLElement | null,
): CSSProperties {
    const [style, setStyle] = useState<CSSProperties>({ display: "none" });

    const element = ref.current;
    const parent = element?.parentElement;

    useEffect(() => {
        if (!parent || !selected) {
            setStyle({ display: "none" });
            return;
        }

        const parentBounding = parent.getBoundingClientRect();
        const boundedBounding = selected.getBoundingClientRect();

        const top = boundedBounding.top - parentBounding.top;
        const left = boundedBounding.left - parentBounding.left;

        setStyle({
            top,
            left,
        });
    }, [parent, selected]);

    return style;
}
