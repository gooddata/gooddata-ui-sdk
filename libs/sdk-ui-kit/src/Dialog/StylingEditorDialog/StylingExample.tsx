// (C) 2022-2025 GoodData Corporation

import { useIntl } from "react-intl";

import { ColorPreview } from "./ColorPreview.js";

/**
 * @internal
 */
export interface IStylingExampleProps {
    name: string;
    colors: string[];
    onClick: () => void;
}

/**
 * @internal
 */
export function StylingExample({ name, colors, onClick }: IStylingExampleProps) {
    const intl = useIntl();

    return (
        <div className="gd-styling-example">
            <div className="gd-styling-example-label">
                <div className="gd-styling-example-label-name">{name}</div>
                <div
                    aria-label="Styling example action"
                    className="gd-styling-example-label-action s-gd-styling-example-label-action"
                    onClick={onClick}
                >
                    {intl.formatMessage({ id: "stylingEditor.dialog.example.paste" })}
                </div>
            </div>
            <ColorPreview className="color-preview-small" colors={colors} />
        </div>
    );
}
