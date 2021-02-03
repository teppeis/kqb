export class QueryFunction<T extends string> {
  #name: string;
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

export function TODAY() {
  return new QueryFunction("TODAY");
}

export function NOW() {
  return new QueryFunction("NOW");
}

export function LOGINUSER() {
  return new QueryFunction("LOGINUSER");
}

export function FROM_TODAY(num: number, unit: "DAYS" | "WEEKS" | "MONTHS" | "YEARS") {
  return new QueryFunction("FROM_TODAY", String(num), unit);
}

type DistributeQueryFunction<T> = T extends string ? QueryFunction<T> : never;

export type UserFunctions = DistributeQueryFunction<"LOGINUSER">;
export type DatetimeFunctions = DistributeQueryFunction<"NOW" | "TODAY" | "FROM_TODAY">;
export type DateFunctions = DistributeQueryFunction<"TODAY" | "FROM_TODAY">;
