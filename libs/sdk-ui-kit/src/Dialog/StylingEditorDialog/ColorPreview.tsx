// (C) 2022-2025 GoodData Corporation
import cx from "classnames";

/**
 * @internal
 */
export interface IColorPreviewProps {
    colors: string[];
    className?: string;
}

/**
 * @internal
 */
export function ColorPreview(props: IColorPreviewProps) {
    return (
        <div className={cx("gd-color-preview", props.className)}>
            {props.colors.map((color, index) => (
                <div
                    key={index}
                    className="gd-color-preview-element"
                    style={{ backgroundColor: color }}
                ></div>
            ))}
        </div>
    );
}
