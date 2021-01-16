export const createBuilder = <FieldDefs extends FieldDefinitionsTypes = any>() =>
  ({
    builder: new Builder(),
    field: conditionCreator,
  } as {
    builder: Builder<FieldDefs>;
    field: ConditionCreator<FieldDefs>;
  });

type ConditionCreator<FieldDefs extends FieldDefinitionsTypes> = <
  FieldCode extends keyof FieldDefs
>(
  fieldCode: FieldCode
) => string extends keyof FieldDefs ? Operator : FieldTypeOperators[FieldDefs[FieldCode]];

const conditionCreator = (fieldCode: string) => {
  return new Operator(fieldCode);
};

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
  eq(value: T): Condition<T> {
    return new Condition(this.#field, "=", value);
  }
  /**
   * `!=` operator
   */
  notEq(value: T): Condition<T> {
    return new Condition(this.#field, "!=", value);
  }
  /**
   * `like` operator
   */
  like(value: string): Condition<string> {
    return new Condition(this.#field, "like", value);
  }
  /**
   * `not like` operator
   */
  notLike(value: string): Condition<string> {
    return new Condition(this.#field, "not like", value);
  }
}

class Condition<T> {
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

/**
 * Escape string literal in query parameters
 */
function esc(str: string): string {
  return str.replace(/"/g, '\\"');
}

type OrderByDirection = "asc" | "desc";
class Builder<FieldDefs extends FieldDefinitionsTypes> {
  #condisions: { joiner: "and" | "or"; condition: Condition<any> }[] = [];
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
  where(condition: Condition<any>): Builder<FieldDefs> {
    return this.and(condition);
  }
  and(condition: Condition<any>): Builder<FieldDefs> {
    this.#condisions.push({ joiner: "and", condition });
    return this;
  }
  or(condition: Condition<any>): Builder<FieldDefs> {
    this.#condisions.push({ joiner: "or", condition });
    return this;
  }
  orderBy(
    field: OrderByTargetFieldNames<FieldDefs>,
    direction: OrderByDirection
  ): Builder<FieldDefs> {
    this.#orderByList.push({ field, direction });
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
