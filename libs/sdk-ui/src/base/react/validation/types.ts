// (C) 2025 GoodData Corporation
/**
 * @internal
 */
export type IValidationSeverity = "error" | "warning" | "info";

/**
 * @internal
 */
export type IInvalidDatapoint = {
    id: string;
    severity: IValidationSeverity;
    message: string;
};

/**
 * @internal
 */
export type IInvalidNode<
    Children extends Record<string, IInvalidNode<any>> = Record<string, IInvalidNode<any>>,
> = {
    id: string;
    invalidDatapoints: IInvalidDatapoint[];
    children: Children;
};

/**
 * @internal
 */
export type IInvalidNodePath<T extends IInvalidNode> =
    | []
    | (T["children"] extends never
          ? never
          :
                | {
                      [K in keyof T["children"]]: [K] | [K, ...IInvalidNodePath<T["children"][K]>];
                  }[keyof T["children"]]
                | [keyof T["children"]]
                | IUnionPaths<T>);

/**
 * @internal
 * Helper type to generate union paths at any level recursively
 */
export type IUnionPaths<T extends IInvalidNode> = T["children"] extends never
    ? never
    : {
          [K in keyof T["children"]]: T["children"][K]["children"] extends never
              ? never
              : [K, keyof T["children"][K]["children"]] | [K, ...IUnionPaths<T["children"][K]>];
      }[keyof T["children"]];

/**
 * @internal
 */
export type IInvalidNodeAtPath<T extends IInvalidNode, Path extends IInvalidNodePath<T>> = Path extends []
    ? T
    : Path extends [infer K, ...infer Rest]
      ? K extends keyof T["children"]
          ? T["children"][K] extends IInvalidNode
              ? Rest extends IInvalidNodePath<T["children"][K]>
                  ? IInvalidNodeAtPath<T["children"][K], Rest>
                  : never
              : T["children"][K]
          : never
      : never;

/**
 * @internal
 */
export type IValidationContextValue<T extends IInvalidNode> = {
    rootNode: T;

    setInvalidDatapoints: <P extends IInvalidNodePath<T>>(
        setter: (
            currentNode: IInvalidNodeAtPath<T, P>,
        ) => Array<IInvalidDatapoint | undefined | null | false>,
        path?: P,
    ) => void;
    getInvalidDatapoints: <P extends IInvalidNodePath<T>>(args?: {
        path?: P;
        recursive?: boolean;
    }) => IInvalidDatapoint[];

    isValid: boolean;

    registerChild: (child: IInvalidNode) => () => void;
};
