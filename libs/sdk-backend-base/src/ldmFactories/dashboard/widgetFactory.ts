// (C) 2019-2022 GoodData Corporation
// import { invariant } from "ts-invariant";
import { ObjRef, IDashboardFilterReference, IWidget } from "@gooddata/sdk-model";
import { Builder, IBuilder, resolveValueOrUpdateCallback, ValueOrUpdateCallback } from "../builder.js";

/**
 * Common widget props builder
 *
 * @alpha
 */
export interface IWidgetBaseBuilder<T extends IWidget> extends IBuilder<T> {
    title(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    description(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    ignoreDashboardFilters(valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardFilterReference[]>): this;
    dateDataSet(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef | undefined>): this;
    ref(valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this;
    id(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
    uri(valueOrUpdateCallback: ValueOrUpdateCallback<string>): this;
}

/**
 * @alpha
 */
export class WidgetBaseBuilder<T extends IWidget> extends Builder<T> implements IWidgetBaseBuilder<T> {
    protected setWidget = (updateCallback: (widget: Partial<T>) => Partial<T>): this => {
        this.item = updateCallback(this.item);
        return this;
    };

    protected setWidgetProp = <K extends keyof T>(
        prop: K,
        valueOrUpdateCallback: ValueOrUpdateCallback<T[K]>,
    ): this => {
        this.setWidget((w) => ({
            ...w,
            [prop]: resolveValueOrUpdateCallback(valueOrUpdateCallback, w[prop]!),
        }));
        return this;
    };

    public title = (valueOrUpdateCallback: ValueOrUpdateCallback<string>): this =>
        this.setWidgetProp("title", valueOrUpdateCallback);

    public description = (valueOrUpdateCallback: ValueOrUpdateCallback<string>): this =>
        this.setWidgetProp("description", valueOrUpdateCallback);

    public ignoreDashboardFilters = (
        valueOrUpdateCallback: ValueOrUpdateCallback<IDashboardFilterReference[]>,
    ): this => this.setWidgetProp("ignoreDashboardFilters", valueOrUpdateCallback);

    public dateDataSet = (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef | undefined>): this =>
        this.setWidgetProp("dateDataSet", valueOrUpdateCallback);

    public ref = (valueOrUpdateCallback: ValueOrUpdateCallback<ObjRef>): this =>
        this.setWidgetProp("ref", valueOrUpdateCallback);

    public id = (valueOrUpdateCallback: ValueOrUpdateCallback<string>): this =>
        this.setWidgetProp("identifier", valueOrUpdateCallback);

    public uri = (valueOrUpdateCallback: ValueOrUpdateCallback<string>): this =>
        this.setWidgetProp("uri", valueOrUpdateCallback);
}
