// (C) 2026 GoodData Corporation

import { useIntl } from "react-intl";

import { UiDate } from "@gooddata/sdk-ui-kit";

import type { ICatalogItem } from "../catalogItem/types.js";
import { ObjectTypeIcon } from "../objectType/ObjectTypeIcon.js";

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
};

type Props = {
    item: ICatalogItem;
    onClick?: (item: ICatalogItem) => void;
};

export function CatalogItemCard({ item, onClick }: Props) {
    const intl = useIntl();

    const handleClick = () => {
        onClick?.(item);
    };

    return (
        <button type="button" className="gd-analytics-catalog__item-card" onClick={handleClick}>
            <ObjectTypeIcon
                className="gd-analytics-catalog__item-card__icon"
                intl={intl}
                type={item.type}
                visualizationType={item.visualizationType}
                size={18}
                backgroundSize={32}
            />
            <div className="gd-analytics-catalog__item-card__info">
                <span className="gd-analytics-catalog__item-card__title">{item.title}</span>
                {item.updatedAt ? (
                    <span className="gd-analytics-catalog__item-card__date">
                        <UiDate
                            date={item.updatedAt}
                            locale={intl.locale}
                            absoluteOptions={DATE_FORMAT_OPTIONS}
                        />
                    </span>
                ) : null}
            </div>
        </button>
    );
}
