// (C) 2019-2026 GoodData Corporation

import { Input } from "@gooddata/sdk-ui-kit";

interface ICatalogSearchProps {
    onChange: (value: string) => void;
    value: string;
    placeholder: string;
}

export function CatalogSearch(props: ICatalogSearchProps) {
    return (
        <div className="adi-catalog-search">
            <Input
                className="s-catalogue-search"
                clearOnEsc
                isSearch
                isSmall
                onChange={(value) => props.onChange(String(value))}
                value={props.value}
                placeholder={props.placeholder}
            />
        </div>
    );
}
