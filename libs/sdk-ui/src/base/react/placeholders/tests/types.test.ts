// (C) 2019-2021 GoodData Corporation
import { IMeasure, IAttribute, IFilter, ISortItem } from "@gooddata/sdk-model";
import {
    IAttributeGroupPlaceholder,
    IAttributePlaceholder,
    IFilterGroupPlaceholder,
    IFilterPlaceholder,
    IMeasureGroupPlaceholder,
    IMeasurePlaceholder,
    ISortGroupPlaceholder,
    ISortPlaceholder,
} from "../factory";
import { PlaceholderResolvedValue, PlaceholderValue } from "../base";

export const expectType = <Type>(_: Type): void => void 0;
export const type = <Type>(): Type => void 0 as any;

// Should return raw single placeholders value
expectType<PlaceholderValue<IMeasurePlaceholder>>(type<IMeasure>());
expectType<PlaceholderValue<IAttributePlaceholder>>(type<IAttribute>());
expectType<PlaceholderValue<IFilterPlaceholder>>(type<IFilter>());
expectType<PlaceholderValue<ISortPlaceholder>>(type<ISortItem>());

// Should return raw group placeholders value
expectType<PlaceholderValue<IMeasureGroupPlaceholder>>(
    type<Array<IMeasure | IMeasurePlaceholder | IMeasureGroupPlaceholder>>(),
);
expectType<PlaceholderValue<IAttributeGroupPlaceholder>>(
    type<Array<IAttribute | IAttributePlaceholder | IAttributeGroupPlaceholder>>(),
);
expectType<PlaceholderValue<IFilterGroupPlaceholder>>(
    type<Array<IFilter | IFilterPlaceholder | IFilterGroupPlaceholder>>(),
);
expectType<PlaceholderValue<ISortGroupPlaceholder>>(
    type<Array<ISortItem | ISortPlaceholder | ISortGroupPlaceholder>>(),
);

// Should return resolved value for single placeholders
expectType<PlaceholderResolvedValue<IAttributePlaceholder>>(type<IAttribute>());
expectType<PlaceholderResolvedValue<IMeasurePlaceholder>>(type<IMeasure>());
expectType<PlaceholderResolvedValue<IFilterPlaceholder>>(type<IFilter>());
expectType<PlaceholderResolvedValue<ISortPlaceholder>>(type<ISortItem>());

// Should return resolved value for group placeholders
expectType<PlaceholderResolvedValue<IMeasureGroupPlaceholder<IMeasure[]>>>(type<IMeasure[]>());
expectType<PlaceholderResolvedValue<IMeasureGroupPlaceholder<IMeasurePlaceholder[]>>>(type<IMeasure[]>());
expectType<PlaceholderResolvedValue<IMeasureGroupPlaceholder<IMeasureGroupPlaceholder<IMeasure[]>[]>>>(
    type<IMeasure[]>(),
);
expectType<PlaceholderResolvedValue<IAttributeGroupPlaceholder<IAttribute[]>>>(type<IAttribute[]>());
expectType<PlaceholderResolvedValue<IAttributeGroupPlaceholder<IAttributePlaceholder[]>>>(
    type<IAttribute[]>(),
);
expectType<PlaceholderResolvedValue<IAttributeGroupPlaceholder<IAttributeGroupPlaceholder<IAttribute[]>[]>>>(
    type<IAttribute[]>(),
);
expectType<PlaceholderResolvedValue<IFilterGroupPlaceholder<IFilter[]>>>(type<IFilter[]>());
expectType<PlaceholderResolvedValue<IFilterGroupPlaceholder<IFilterPlaceholder[]>>>(type<IFilter[]>());
expectType<PlaceholderResolvedValue<IFilterGroupPlaceholder<IFilterGroupPlaceholder<IFilter[]>[]>>>(
    type<IFilter[]>(),
);
expectType<PlaceholderResolvedValue<ISortGroupPlaceholder<ISortItem[]>>>(type<ISortItem[]>());
expectType<PlaceholderResolvedValue<ISortGroupPlaceholder<ISortPlaceholder[]>>>(type<ISortItem[]>());
expectType<PlaceholderResolvedValue<ISortGroupPlaceholder<ISortGroupPlaceholder<ISortItem[]>[]>>>(
    type<ISortItem[]>(),
);
