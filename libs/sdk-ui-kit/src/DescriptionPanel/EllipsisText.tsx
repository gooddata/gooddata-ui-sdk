// (C) 2022-2023 GoodData Corporation
import React, { useMemo, useState } from "react";
import { useIntl } from "react-intl";
import cx from "classnames";

const LINE_LENGTH = 28;
const LINE_NUMBER = 10;

/**
 * @internal
 */
export interface IEllipsisTextProps {
    text: string;
    maxLines?: number;
}

/**
 * Multiline ellipsis does not exist natively, so this is a simple version of it.
 *
 * The component cuts the text at approximately 'maxLines' lines.
 * It renders button 'Show more'/'Show less'.
 * The new line character poses the most trouble to calculate the cut point,
 * so it will estimate how much character worth of space was taken by it.
 *
 * There is several constants: the width is taken as 190px, the font-size is
 * 13px. The text is wrapped by words, so 28 characters is an approximate count
 * per line. By these metrics it can find a point to shorten the text. It is not
 * precise value, but it works most of the time, sometimes rendering 9 or 11 lines,
 * which is acceptable for this component usage.
 *
 * @internal
 */
export const EllipsisText: React.FC<IEllipsisTextProps> = (props) => {
    const { text, maxLines = LINE_NUMBER } = props;
    const [collapsed, setCollapsed] = useState(true);
    const intl = useIntl();

    const overflowIndex = useMemo(() => {
        const maxLength = maxLines * LINE_LENGTH;
        let positionWithNewLine = 0;

        for (let i = 0; i < text.length; i++) {
            if (text[i] === "\n" || text[i] === "\r" || text[i] === "\r\n") {
                const usedCharactersOnLine = positionWithNewLine % LINE_LENGTH;
                const remainingCharactersOnLine = LINE_LENGTH - usedCharactersOnLine;
                positionWithNewLine += remainingCharactersOnLine;
            } else {
                positionWithNewLine++;
            }

            if (positionWithNewLine > maxLength) {
                return i;
            }
        }

        return null;
    }, [text, maxLines]);

    return (
        <div className="gd-ellipsis-text">
            <div className={cx("gd-ellipsis-text-content", { "gd-ellipsis-text-fixed": overflowIndex })}>
                {overflowIndex && collapsed ? (
                    <>
                        <span>{text.slice(0, overflowIndex - 1)}</span>
                        <span style={{ userSelect: "none" }}>…</span>
                    </>
                ) : (
                    <span>{text}</span>
                )}
            </div>
            {overflowIndex ? (
                <button
                    className="gd-ellipsis-text-button"
                    onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
                >
                    {collapsed
                        ? intl.formatMessage({ id: "descriptionPanel.button.more" })
                        : intl.formatMessage({ id: "descriptionPanel.button.less" })}
                </button>
            ) : null}
        </div>
    );
};
