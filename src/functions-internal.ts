type UserFunctionName = "LOGINUSER";
type OrganizationFunctionName = "PRIMARY_ORGANIZATION";
type DateFunctionName =
  | "TODAY"
  | "YESTERDAY"
  | "TOMORROW"
  | "FROM_TODAY"
  | "THIS_WEEK"
  | "LAST_WEEK"
  | "NEXT_WEEK"
  | "THIS_MONTH"
  | "LAST_MONTH"
  | "NEXT_MONTH"
  | "THIS_YEAR"
  | "LAST_YEAR"
  | "NEXT_YEAR";
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
  /**
   * NOTE: make public for nominal type checking with the type parameter
   */
  readonly name: T;
  #args: string[];
  /**
   * @param name
   * @param args escaped arguments string
   */
  constructor(name: T, ...args: string[]) {
    this.name = name;
    this.#args = args;
  }
  toString(): string {
    return `${this.name}(${this.#args.join(", ")})`;
  }
}
