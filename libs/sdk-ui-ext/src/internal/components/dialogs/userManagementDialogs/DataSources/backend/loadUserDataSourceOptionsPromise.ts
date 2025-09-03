// (C) 2023-2025 GoodData Corporation

import { IntlShape, defineMessages } from "react-intl";

import { IAnalyticalBackend } from "@gooddata/sdk-backend-spi";

import { IDataSourceSelectOption, ISelectErrorOption } from "../../types.js";

const messages = defineMessages({
    searchDataSourceError: { id: "userManagement.dataSource.searchError" },
});

const createErrorOption = (intl: IntlShape): ISelectErrorOption[] => {
    return [
        {
            isDisabled: true,
            type: "error",
            label: intl.formatMessage(messages.searchDataSourceError),
        },
    ];
};

export const loadUserDataSourceOptionsPromise =
    (backend: IAnalyticalBackend, intl: IntlShape) =>
    async (inputValue: string): Promise<IDataSourceSelectOption[] | ISelectErrorOption[]> => {
        try {
            const dataSources = await backend.dataSources().getDataSourceIdentifiers();

            return dataSources
                .filter((ds) => ds.name.toLocaleLowerCase().includes(inputValue.toLowerCase()))
                .sort((itemA, itemB): number => {
                    const textA = itemA.name.toUpperCase();
                    const textB = itemB.name.toUpperCase();
                    return textA.localeCompare(textB);
                })
                .map((dataSource) => ({
                    label: dataSource.id,
                    value: dataSource,
                }));
        } catch {
            return createErrorOption(intl);
        }
    };
