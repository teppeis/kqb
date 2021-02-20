type UserFunctionName = "LOGINUSER";
type OrganizationFunctionName = "PRIMARY_ORGANIZATION";
type DateFunctionName = "TODAY" | "FROM_TODAY";
type DateTimeFunctionName = "NOW" | DateFunctionName;
type QueryFunctionName =
  | UserFunctionName
  | OrganizationFunctionName
  | DateFunctionName
  | DateTimeFunctionName;

type DistributeQueryFunction<T extends QueryFunctionName> = T extends QueryFunctionName
  ? QueryFunction<T>
  : never;

export type UserFunctions = DistributeQueryFunction<UserFunctionName>;
export type OrganizationFunctions = DistributeQueryFunction<OrganizationFunctionName>;
export type DatetimeFunctions = DistributeQueryFunction<DateTimeFunctionName>;
export type DateFunctions = DistributeQueryFunction<DateFunctionName>;
export type AnyFunctions = DistributeQueryFunction<QueryFunctionName>;

export class QueryFunction<T extends QueryFunctionName> {
  #name: T;
  #args: string[];
  /**
   * @param name
   * @param args escaped arguments string
   */
  constructor(name: T, ...args: string[]) {
    this.#name = name;
    this.#args = args;
  }
  toString(): string {
    return `${this.#name}(${this.#args.join(", ")})`;
  }
}
