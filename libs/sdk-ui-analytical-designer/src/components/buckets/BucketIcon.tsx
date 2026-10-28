// (C) 2007-2026 GoodData Corporation

import { useMemo } from "react";

import { getBucketIcon } from "@gooddata/sdk-ui-ext/internal";

function isLocalBucketIcon(icon: string | undefined) {
    return !!icon && icon.startsWith("local:");
}

interface IBucketIconProps {
    icon?: string;
}

export function BucketIcon({ icon }: IBucketIconProps) {
    // Called as a plain render function, the same way the ui-kit InsightIcon renders its map entries.
    const renderLocalIcon = getBucketIcon(icon);

    // Anything that is not a known `local:` id is treated as an external image URL.
    const externalIconUrl = !renderLocalIcon && !isLocalBucketIcon(icon) ? icon : undefined;

    const style = useMemo(() => {
        return externalIconUrl
            ? {
                  backgroundImage: `url("${externalIconUrl}")`,
              }
            : undefined;
    }, [externalIconUrl]);

    return (
        <div className="bucket-title-icon" style={style}>
            {renderLocalIcon ? renderLocalIcon({ ariaHidden: true }) : null}
        </div>
    );
}
