// (C) 2026 GoodData Corporation

import { LoadingComponent } from "@gooddata/sdk-ui";
import { bemFactory } from "@gooddata/sdk-ui-kit";

const { e } = bemFactory("gd-host-root");

export function FullScreenLoader() {
    return (
        <div className={e("loading")}>
            <LoadingComponent height={40} />
        </div>
    );
}
