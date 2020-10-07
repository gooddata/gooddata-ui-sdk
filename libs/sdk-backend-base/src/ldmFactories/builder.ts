// (C) 2019-2020 GoodData Corporation
/**
 * We are using Builder pattern to create sdk-model objects https://en.wikipedia.org/wiki/Builder_pattern
 * Each sdk-model should have its own builder, and you should use it.
 *
 * This class serves to:
 * - unify all builders & builder factories across our codebase
 * - hold all common methods and properties of builders (e.g. item & build)
 *
 * @beta
 */
export class Builder<T> implements IBuilder<T> {
    constructor(protected item: Partial<T>, protected validator?: (item: Partial<T>) => void) {}

    public build(): T {
        return this.item as T;
    }

    public modify(modifications: BuilderModifications<this, T>): this {
        this.item = modifications(this).build();
        return this;
    }

    public validate(): this {
        if (typeof this.validator !== "function") {
            throw new Error("Validator was not provided!");
        }
        this.validator(this.item);
        return this;
    }
}

/**
 * Common builder interface
 * @beta
 */
export interface IBuilder<T> {
    /**
     * Build & return current item
     */
    build(): T;

    /**
     * Modify current item with set of modifications
     */
    modify(modifications: BuilderModifications<this, T>): this;

    /**
     * Validate current item, throws error when item is not valid
     */
    validate(): this;
}

/**
 * Extracts item type from generic builder type
 *
 * @beta
 */
export type ExtractBuilderType<TBuilder> = TBuilder extends IBuilder<infer TItem> ? TItem : never;

/**
 * Type that represents generic builder constructor
 *
 * @beta
 */
export type BuilderConstructor<TBuilder extends IBuilder<TItem>, TItem> = new (
    item: Partial<TItem>,
) => TBuilder;

/**
 * Function that will be called to perform modifications on item before it is fully constructed
 *
 * @beta
 */
export type BuilderModifications<TBuilder extends IBuilder<TItem>, TItem = ExtractBuilderType<TBuilder>> = (
    builder: TBuilder,
) => TBuilder;

/**
 * Generic builder factory to create sdk-model objects using builder pattern
 *
 * @beta
 */
export function builderFactory<
    TItem,
    TBuilder extends Builder<TItem>,
    TBuilderConstructor extends BuilderConstructor<TBuilder, TItem>
>(
    Builder: TBuilderConstructor,
    defaultItem: Partial<TItem>,
    modifications: BuilderModifications<TBuilder, TItem>,
): TItem {
    const builder = new Builder(defaultItem);
    const result = modifications(builder).build();
    return result;
}
