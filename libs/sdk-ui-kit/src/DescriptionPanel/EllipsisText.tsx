// (C) 2022 GoodData Corporation
import React, { useState } from "react";
import { useIntl } from "react-intl";

/**
 * @internal
 */
export interface IEllipsisTextProps {
    text: string;
    maxLength?: number;
}

/**
 * @internal
 */
export const EllipsisText: React.FC<IEllipsisTextProps> = (props) => {
    const { text, maxLength = 280 } = props;
    const [collapsed, setCollapsed] = useState(true);
    const longText = text.length > maxLength;
    const intl = useIntl();

    return (
        <div className="gd-ellipsis-text">
            <div className="gd-ellipsis-text-content">
                {longText && collapsed ? (
                    <>
                        <span>{text.slice(0, maxLength)}</span>
                        <span style={{ userSelect: "none" }}>…</span>
                    </>
                ) : (
                    <span>{text}</span>
                )}
            </div>
            {longText && (
                <button
                    className="gd-ellipsis-text-button"
                    onClick={() => setCollapsed((isCollapsed) => !isCollapsed)}
                >
                    {collapsed
                        ? intl.formatMessage({ id: "descriptionPanel.button.more" })
                        : intl.formatMessage({ id: "descriptionPanel.button.less" })}
                </button>
            )}
        </div>
    );
};
