export const UserFunctionNames = ["LOGINUSER"] as const;
export type UserFunctionNames = (typeof UserFunctionNames)[number];
export const OrganizationFunctionNames = ["PRIMARY_ORGANIZATION"] as const;
export type OrganizationFunctionNames = (typeof OrganizationFunctionNames)[number];
export const DateFunctionNames = [
  "TODAY",
  "YESTERDAY",
  "TOMORROW",
  "FROM_TODAY",
  "THIS_WEEK",
  "LAST_WEEK",
  "NEXT_WEEK",
  "THIS_MONTH",
  "LAST_MONTH",
  "NEXT_MONTH",
  "THIS_YEAR",
  "LAST_YEAR",
  "NEXT_YEAR",
] as const;
export type DateFunctionNames = (typeof DateFunctionNames)[number];
export const DateTimeFunctionNames = ["NOW", ...DateFunctionNames] as const;
export type DateTimeFunctionNames = (typeof DateTimeFunctionNames)[number];
export const QueryFunctionNames = [
  ...UserFunctionNames,
  ...OrganizationFunctionNames,
  ...DateTimeFunctionNames,
] as const;
export type QueryFunctionNames = (typeof QueryFunctionNames)[number];

type DistributeQueryFunction<T extends QueryFunctionNames> = T extends QueryFunctionNames
  ? QueryFunction<T>
  : never;

export type UserFunctions = DistributeQueryFunction<UserFunctionNames>;
export type OrganizationFunctions = DistributeQueryFunction<OrganizationFunctionNames>;
export type DateTimeFunctions = DistributeQueryFunction<DateTimeFunctionNames>;
export type DateFunctions = DistributeQueryFunction<DateFunctionNames>;
export type AnyFunctions = DistributeQueryFunction<QueryFunctionNames>;

export class QueryFunction<T extends QueryFunctionNames> {
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

export type Day =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";
export type FromTodayUnit = "DAYS" | "WEEKS" | "MONTHS" | "YEARS";
