import { QueryFunction } from "./functions-internal";

export interface Condition {
  toQuery(): string;
}

export class SingleCondition<T> implements Condition {
  #field: string;
  #op: string;
  #value: T;
  constructor(fieldCode: string, op: string, value: T) {
    this.#field = fieldCode;
    this.#op = op;
    this.#value = value;
  }
  toQuery(): string {
    return `${this.#field} ${this.#op} ${stringifyValue(this.#value)}`;
  }
}

function stringifyValue(value: any): string {
  if (value instanceof QueryFunction) {
    return value.toString();
  } else {
    return `"${esc(String(value))}"`;
  }
}

export class InCondition<T> implements Condition {
  #field: string;
  #op: "in" | "not in";
  #values: T[];
  constructor(fieldCode: string, op: "in" | "not in", values: T[]) {
    if (values.length === 0) {
      throw new TypeError("`values` requires at least 1 item");
    }
    this.#field = fieldCode;
    this.#op = op;
    this.#values = values;
  }
  toQuery(): string {
    const values = this.#values.map((v) => `${stringifyValue(v)}`).join(", ");
    return `${this.#field} ${this.#op} (${values})`;
  }
}

class AndOrCondition implements Condition {
  #conditions: Condition[];
  #op: "and" | "or";
  constructor(op: "and" | "or", condition: Condition, ...conditions: Condition[]) {
    this.#op = op;
    this.#conditions = [condition, ...conditions];
  }
  toQuery(): string {
    return `(${this.#conditions.map((c) => c.toQuery()).join(` ${this.#op} `)})`;
  }
}

export const and = (condition: Condition, ...conditions: Condition[]) =>
  new AndOrCondition("and", condition, ...conditions);

export const or = (condition: Condition, ...conditions: Condition[]) =>
  new AndOrCondition("or", condition, ...conditions);

/**
 * Escape string literal in query parameters
 */
function esc(str: string): string {
  return str.replace(/"/g, '\\"');
}
