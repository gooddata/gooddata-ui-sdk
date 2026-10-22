// (C) 2026 GoodData Corporation

import {
    type IClusteringConfig,
    type IClusteringResult,
    type ICollectionItemsConfig,
    type ICollectionItemsResult,
    type IDataView,
    type IForecastConfig,
    type IForecastResult,
    type IForecastView,
    type IOutliersConfig,
    type IOutliersResult,
    type IOutliersView,
} from "@gooddata/sdk-backend-spi";
import {
    type IAttributeDescriptor,
    type IDimensionItemDescriptor,
    type IResultAttributeHeader,
    type IResultHeader,
    isAttributeDescriptor,
    isResultAttributeHeader,
} from "@gooddata/sdk-model";

import { type ValueFormatter } from "./dataAccessConfig.js";

/**
 * A whole string in plain decimal or exponent notation, the way the backend sends numeric values.
 */
const NUMBER_PATTERN = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?$/;

/**
 * Formats the raw element value if the whole value is a number; empty values and values that are not
 * numbers (e.g. "12 Main St", "2011-04" or "0x1A") are left alone, so that they are never mangled.
 *
 * @param name - raw element value
 * @param format - number format to apply
 * @param valueFormatter - formatter applying the number format
 * @internal
 */
export function formatAttributeValue(
    name: string | null,
    format: string,
    valueFormatter: ValueFormatter,
): string | null {
    if (name === null || name === "") {
        return name;
    }

    if (!NUMBER_PATTERN.test(name.trim()) || !Number.isFinite(Number(name))) {
        return name;
    }

    return valueFormatter(name, format);
}

/**
 * Gets the value to display for the attribute element.
 *
 * @remarks
 * Prefers the already formatted name (dates, or attribute values formatted with
 * {@link formatAttributeHeaderValues}). Otherwise, when the descriptor carries a number format, formats the
 * raw element name with it. Falls back to the raw element name. Never falls back to the element uri, as that
 * holds the primary label value, not the display value.
 *
 * @param header - attribute element header
 * @param descriptor - descriptor of the attribute the header belongs to
 * @param valueFormatter - formatter to apply the number format with
 * @internal
 */
export function attributeHeaderDisplayValue(
    header: IResultAttributeHeader,
    descriptor?: IAttributeDescriptor,
    valueFormatter?: ValueFormatter,
): string | null {
    const { formattedName, name } = header.attributeHeaderItem;

    if (formattedName !== undefined) {
        return formattedName;
    }

    const numberFormat = descriptor?.attributeHeader.numberFormat;

    if (numberFormat && valueFormatter) {
        return formatAttributeValue(name, numberFormat, valueFormatter);
    }

    return name ?? null;
}

function formatHeaders(
    headers: IResultHeader[],
    format: string,
    valueFormatter: ValueFormatter,
): IResultHeader[] {
    return headers.map((header) => {
        if (!isResultAttributeHeader(header) || header.attributeHeaderItem.formattedName !== undefined) {
            return header;
        }

        const formattedName = formatAttributeValue(header.attributeHeaderItem.name, format, valueFormatter);

        if (formattedName === null || formattedName === header.attributeHeaderItem.name) {
            return header;
        }

        return {
            attributeHeaderItem: {
                ...header.attributeHeaderItem,
                formattedName,
            },
        };
    });
}

/**
 * Data view whose header items were replaced; everything else is read from the original view.
 */
class DataViewWithHeaderItems implements IDataView {
    constructor(
        private readonly original: IDataView,
        public readonly headerItems: IResultHeader[][][],
    ) {}

    get offset() {
        return this.original.offset;
    }
    get count() {
        return this.original.count;
    }
    get totalCount() {
        return this.original.totalCount;
    }
    get data() {
        return this.original.data;
    }
    get totals() {
        return this.original.totals;
    }
    get totalTotals() {
        return this.original.totalTotals;
    }
    get definition() {
        return this.original.definition;
    }
    get result() {
        return this.original.result;
    }
    get context() {
        return this.original.context;
    }
    get metadata() {
        return this.original.metadata;
    }
    get forecastConfig() {
        return this.original.forecastConfig;
    }
    get forecastResult() {
        return this.original.forecastResult;
    }
    get outliersConfig() {
        return this.original.outliersConfig;
    }
    get outliersResult() {
        return this.original.outliersResult;
    }
    get clusteringConfig() {
        return this.original.clusteringConfig;
    }
    get clusteringResult() {
        return this.original.clusteringResult;
    }
    get warnings() {
        return this.original.warnings;
    }

    equals(other: IDataView): boolean {
        return this.original.equals(other);
    }
    fingerprint(): string {
        return this.original.fingerprint();
    }
    forecast(): IForecastView {
        return this.original.forecast();
    }
    clustering(): IClusteringResult {
        return this.original.clustering();
    }
    outliers(): IOutliersView {
        return this.original.outliers();
    }
    withForecast(config?: IForecastConfig, result?: IForecastResult): IDataView {
        return new DataViewWithHeaderItems(this.original.withForecast(config, result), this.headerItems);
    }
    withClustering(config?: IClusteringConfig, result?: IClusteringResult): IDataView {
        return new DataViewWithHeaderItems(this.original.withClustering(config, result), this.headerItems);
    }
    withOutliers(config?: IOutliersConfig, result?: IOutliersResult): IDataView {
        return new DataViewWithHeaderItems(this.original.withOutliers(config, result), this.headerItems);
    }
    readCollectionItems(config: ICollectionItemsConfig): Promise<ICollectionItemsResult> {
        return this.original.readCollectionItems(config);
    }
}

/**
 * Formats element values of attributes that carry a number format.
 *
 * @remarks
 * For every attribute descriptor with a number format on the result header, the element headers get a
 * `formattedName` holding the value
 * formatted the same way measure values are. Element headers that already have a `formattedName` (dates)
 * and values that are not numbers are left untouched. The raw element `name` and `uri` stay as they are,
 * so drilling, sorting and grouping keep working on the original values.
 *
 * The original data view is not mutated; when nothing needs formatting it is returned as is.
 *
 * @param dataView - data view to format
 * @param valueFormatter - formatter applying a number format to a value; use one that does not escape
 *  HTML, the display sites escape on their own
 * @internal
 */
export function formatAttributeHeaderValues(dataView: IDataView, valueFormatter: ValueFormatter): IDataView {
    let changed = false;

    const headerItems = dataView.result.dimensions.map((dimension, dimensionIndex) => {
        const dimensionHeaderItems = dataView.headerItems[dimensionIndex] ?? [];

        return dimension.headers.map((descriptor: IDimensionItemDescriptor, headerIndex) => {
            const headers = dimensionHeaderItems[headerIndex] ?? [];

            if (!isAttributeDescriptor(descriptor)) {
                return headers;
            }

            const format = descriptor.attributeHeader.numberFormat;

            if (!format) {
                return headers;
            }

            const formatted = formatHeaders(headers, format, valueFormatter);
            changed = changed || formatted.some((header, idx) => header !== headers[idx]);

            return formatted;
        });
    });

    return changed ? new DataViewWithHeaderItems(dataView, headerItems) : dataView;
}
