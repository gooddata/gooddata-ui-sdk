// (C) 2025 GoodData Corporation
import { LoadingDots } from "@gooddata/sdk-ui-kit";

/**
 * TODO: new ui-kit component
 *
 * @alpha
 */
export function LoadingComponent() {
    return (
        <div
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                width: "100%",
            }}
        >
            <LoadingDots />
        </div>
    );
}
