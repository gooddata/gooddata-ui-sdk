// (C) 2025 GoodData Corporation

import { useCallback, useMemo } from "react";

import { cloneDeep, set } from "lodash-es";
import { useIntl } from "react-intl";

import { type IPushData } from "@gooddata/sdk-ui";

import { ConfigSection } from "./ConfigSection.js";
import { DropdownControl } from "./DropdownControl.js";
import { messages } from "../../../locales.js";
import { type IVisualizationProperties } from "../../interfaces/Visualization.js";

export interface IPagingSectionProps {
    properties?: IVisualizationProperties;
    propertiesMeta?: any;
    pushData?: (data: any) => void;
    isDisabled?: boolean;
}

const DEFAULT_PAGE_SIZE = -1;

export function PagingSection({
    properties,
    propertiesMeta,
    pushData,
    isDisabled = false,
}: IPagingSectionProps) {
    const intl = useIntl();
    const paginationEnabled = !!properties?.controls?.["pagination"]?.enabled;
    const pageSize = properties?.controls?.["pageSize"] ?? DEFAULT_PAGE_SIZE;
    const pageSizeDropdownItems = useMemo(
        () => [
            { title: intl.formatMessage(messages["pagingPageSizeAuto"]), value: -1 },
            { title: "20", value: 20 },
            { title: "50", value: 50 },
            { title: "100", value: 100 },
            { title: "200", value: 200 },
        ],
        [intl],
    );

    // Wrap pushData to intercept pagination.enabled changes and manage pageSize
    const wrappedPushData = useCallback(
        (data: IPushData) => {
            const newPaginationEnabled = data?.properties?.controls?.["pagination"]?.enabled;

            if (newPaginationEnabled === true) {
                // When enabling pagination, ensure pageSize is set
                const clonedProperties = cloneDeep(data.properties);

                if (!clonedProperties?.controls?.["pageSize"]) {
                    set(clonedProperties!, "controls.pageSize", DEFAULT_PAGE_SIZE);
                }

                pushData?.({ ...data, properties: clonedProperties });
            } else if (newPaginationEnabled === false) {
                // When disabling pagination, also reset pageSize
                const clonedProperties = cloneDeep(data.properties);
                set(clonedProperties!, "controls.pageSize", undefined);

                pushData?.({ ...data, properties: clonedProperties });
            } else {
                // For other cases (e.g., pageSize dropdown changes), just pass through
                pushData?.(data);
            }
        },
        [pushData],
    );

    return (
        <ConfigSection
            id="paging_section"
            className="gd-paging-section"
            title={messages["pagingTitle"].id}
            valuePath="pagination.enabled"
            canBeToggled
            toggledOn={paginationEnabled}
            toggleDisabled={isDisabled}
            propertiesMeta={propertiesMeta}
            properties={properties}
            pushData={wrappedPushData}
        >
            <DropdownControl
                value={pageSize}
                valuePath="pageSize"
                labelText={messages["pagingPageSize"].id}
                disabled={isDisabled || !paginationEnabled}
                properties={properties}
                pushData={pushData}
                items={pageSizeDropdownItems}
                showDisabledMessage={isDisabled}
            />
        </ConfigSection>
    );
}
