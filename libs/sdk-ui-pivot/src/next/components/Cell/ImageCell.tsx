// (C) 2025-2026 GoodData Corporation

import { useCallback, useState } from "react";

import { IconImage } from "@gooddata/sdk-ui-kit";

import { e } from "../../features/styling/bem.js";

/**
 * Props for the ImageCell component.
 *
 * @internal
 */
interface IImageCellProps {
    /**
     * Image source URL
     */
    src?: string | null;
    /**
     * Alternative text for the image (e.g., primary label value like "Product Name")
     */
    alt?: string;
}

/**
 * Component for rendering images in pivot table cells with error handling.
 *
 * Displays a placeholder icon when the image fails to load or when no source is provided.
 *
 * @internal
 */
export function ImageCell({ src, alt }: IImageCellProps) {
    const [imageLoadError, setImageLoadError] = useState(false);
    const handleError = useCallback(() => setImageLoadError(true), []);

    if (!src || imageLoadError) {
        return (
            <div className={e("cell-image-empty")}>
                <IconImage />
            </div>
        );
    }

    return <img className={e("cell-image")} src={src} alt={alt ?? src} onError={handleError} />;
}
