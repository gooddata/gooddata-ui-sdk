// (C) 2021-2022 GoodData Corporation
import React, { useMemo } from "react";
import { useBackendStrict } from "@gooddata/sdk-ui";
import { AttributeFilterRenderer } from "./Components/AttributeFilterRenderer";
import { IAttributeFilterBaseProps } from "./types";
import { validateAttributeFilterProps } from "./utils";
import { AttributeFilterProviders } from "./AttributeFilterProviders";
import stableStringify from "json-stable-stringify";
import { useWorkspaceStrict } from "../../../sdk-ui/src/base/react/WorkspaceContext";

/**
 * @internal
 */
export const AttributeFilterBase: React.FC<IAttributeFilterBaseProps> = (props) => {
    const backend = useBackendStrict(props.backend, "AttributeFilter");
    const workspace = useWorkspaceStrict(props.workspace, "AttributeFilter");
    const { filter, locale, hiddenElements, staticElements, fullscreenOnMobile, parentFilters, title } =
        props;

    const complexTelemetryPropsCheck = useMemo(() => {
        return stableStringify({ filter, hiddenElements, staticElements, parentFilters });
    }, [filter, hiddenElements, staticElements, parentFilters]);

    const backendWithTelemetry = useMemo(() => {
        return backend.withTelemetry("AttributeFilter", {
            workspace,
            locale,
            title,
            fullscreenOnMobile,
            filter,
            hiddenElements,
            staticElements,
            parentFilters,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [backend, workspace, locale, title, fullscreenOnMobile, complexTelemetryPropsCheck]);

    validateAttributeFilterProps({ backend, ...props });

    return (
        <AttributeFilterProviders {...props} backend={backendWithTelemetry}>
            <AttributeFilterRenderer />
        </AttributeFilterProviders>
    );
};
