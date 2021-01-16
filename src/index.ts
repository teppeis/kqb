export const createBuilder = <FieldDefs extends FieldDefinitionsTypes = any>() => ({
  builder: new Builder<FieldDefs>(),
  field: <FieldCode extends StringKeyOf<FieldDefs>>(fieldCode: FieldCode) => {
    return new Operator(fieldCode) as string extends StringKeyOf<FieldDefs>
      ? Operator // when FieldDefs is omitted
      : FieldTypeOperators[FieldDefs[FieldCode]];
  },
});

type StringKeyOf<T> = Extract<keyof T, string>;
type FieldTypeOperators = {
  SINGLE_LINE_TEXT: Pick<Operator<string>, "eq" | "notEq" | "like" | "notLike">;
  NUMBER: Pick<Operator<string | number>, "eq" | "notEq">;
};
type FieldDefinitionsTypes = Record<string, keyof FieldTypeOperators>;
type SortableFieldTypes = "NUMBER";
type OrderByTargetFieldNames<T> = {
  [K in keyof T]: T[K] extends SortableFieldTypes ? K : never;
}[keyof T];

class Operator<T = string | number> {
  #field: string;
  constructor(fieldCode: string) {
    this.#field = fieldCode;
  }
  /**
   * `=` operator
   */
  eq(value: T) {
    return new SingleCondition(this.#field, "=", value);
  }
  /**
   * `!=` operator
   */
  notEq(value: T) {
    return new SingleCondition(this.#field, "!=", value);
  }
  /**
   * `like` operator
   */
  like(value: string) {
    return new SingleCondition(this.#field, "like", value);
  }
  /**
   * `not like` operator
   */
  notLike(value: string) {
    return new SingleCondition(this.#field, "not like", value);
  }
  /**
   * `in` operator
   */
  in(value: T, ...values: T[]) {
    return new InCondition(this.#field, "in", [value, ...values]);
  }
  /**
   * not `in` operator
   */
  notIn(value: T, ...values: T[]) {
    return new InCondition(this.#field, "not in", [value, ...values]);
  }
}

interface Condition {
  toQuery(): string;
}

class SingleCondition<T> implements Condition {
  #field: string;
  #op: string;
  #value: T;
  constructor(fieldCode: string, op: string, value: T) {
    this.#field = fieldCode;
    this.#op = op;
    this.#value = value;
  }
  toQuery(): string {
    return `${this.#field} ${this.#op} "${esc(String(this.#value))}"`;
  }
}

class InCondition<T> implements Condition {
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
    const values = this.#values.map((v) => `"${esc(String(v))}"`).join(", ");
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

export const and = (condition: Condition, ...conditions: Condition[]) => {
  return new AndOrCondition("and", condition, ...conditions);
};

export const or = (condition: Condition, ...conditions: Condition[]) => {
  return new AndOrCondition("or", condition, ...conditions);
};

/**
 * Escape string literal in query parameters
 */
function esc(str: string): string {
  return str.replace(/"/g, '\\"');
}

type OrderByDirection = "asc" | "desc";
type OrderByTargetPair<FieldDefs> = [
  field: OrderByTargetFieldNames<FieldDefs>,
  direction: OrderByDirection
];

class Builder<FieldDefs extends FieldDefinitionsTypes> {
  #condisions: { joiner: "and" | "or"; condition: Condition }[] = [];
  #orderByList: { field: OrderByTargetFieldNames<FieldDefs>; direction: OrderByDirection }[] = [];
  #limit: number | null = null;
  #offset: number | null = null;

  build(): string {
    const buf: string[] = [];
    if (this.#condisions.length > 0) {
      buf.push(
        this.#condisions
          .map(
            ({ joiner, condition }, index) =>
              `${index > 0 ? `${joiner} ` : ""}${condition.toQuery()}`
          )
          .join(" ")
      );
    }
    if (this.#orderByList.length > 0) {
      buf.push("order by");
      buf.push(this.#orderByList.map(({ field, direction }) => `${field} ${direction}`).join(", "));
    }
    if (this.#limit != null) {
      buf.push(`limit ${this.#limit}`);
    }
    if (this.#offset != null) {
      buf.push(`offset ${this.#offset}`);
    }
    return buf.join(" ");
  }
  where(condition: Condition): Builder<FieldDefs> {
    return this.and(condition);
  }
  and(condition: Condition): Builder<FieldDefs> {
    this.#condisions.push({ joiner: "and", condition });
    return this;
  }
  or(condition: Condition): Builder<FieldDefs> {
    this.#condisions.push({ joiner: "or", condition });
    return this;
  }
  orderBy(
    field: OrderByTargetFieldNames<FieldDefs>,
    direction: OrderByDirection
  ): Builder<FieldDefs>;
  orderBy(
    pair: OrderByTargetPair<FieldDefs>,
    ...pairs: OrderByTargetPair<FieldDefs>[]
  ): Builder<FieldDefs>;
  orderBy(...args: OrderByTargetPair<FieldDefs> | OrderByTargetPair<FieldDefs>[]) {
    if (args.length === 0) {
      throw new TypeError("orderBy() requires at least one argument");
    }
    // orderBy(["foo", "asc"], ["bar", "desc"])
    let pairs = args as OrderByTargetPair<FieldDefs>[];
    if (args.length === 2) {
      const [mayBeField, mayBeDirection] = args;
      if (!Array.isArray(mayBeField) && !Array.isArray(mayBeDirection)) {
        // orderBy("foo", "asc")
        pairs = [[mayBeField, mayBeDirection]];
      }
    }
    this.#orderByList.push(...pairs.map(([field, direction]) => ({ field, direction })));
    return this;
  }
  limit(numberOfRows: number): Builder<FieldDefs> {
    this.#limit = numberOfRows;
    return this;
  }
  offset(offset: number): Builder<FieldDefs> {
    this.#offset = offset;
    return this;
  }
}
