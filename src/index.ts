export const createBuilder = <FieldDefs extends FieldDefinitionsType>() =>
  ({
    builder: new Builder(),
    field: conditionCreator,
  } as {
    builder: Builder;
    field: ConditionCreator<FieldDefs>;
  });

type ConditionCreator<FieldDefs extends FieldDefinitionsType> = <FieldCode extends keyof FieldDefs>(
  fieldCode: FieldCode
) => string extends keyof FieldDefs ? Operator : FieldTypeOperators[FieldDefs[FieldCode]];

const conditionCreator = (fieldCode: string) => {
  return new Operator(fieldCode);
};

type FieldTypeOperators = {
  SINGLE_LINE_TEXT: Pick<Operator<string>, "eq" | "notEq" | "like" | "notLike">;
  NUMBER: Pick<Operator<string | number>, "eq" | "notEq">;
};
type FieldDefinitionsType = Record<string, keyof FieldTypeOperators>;
type SortableFieldTypes = "NUMBER";
type OrderByTargetFieldNames<T> = {
  [K in keyof T]: T[K] extends SortableFieldTypes ? K : never;
}[keyof T];

class Operator<T = string | number> {
  #field: string;
  constructor(fieldCode: string) {
    this.#field = fieldCode;
  }
  eq(value: T): Condition<T> {
    return new Condition(this.#field, "=", value);
  }
  notEq(value: T): Condition<T> {
    return new Condition(this.#field, "!=", value);
  }
  like(value: string): Condition<string> {
    return new Condition(this.#field, "like", value);
  }
  notLike(value: string): Condition<string> {
    return new Condition(this.#field, "not like", value);
  }
}

class Condition<T> {
  #fieldCode: string;
  #op: string;
  #value: T;
  constructor(fieldCode: string, op: string, value: T) {
    this.#fieldCode = fieldCode;
    this.#op = op;
    this.#value = value;
  }
  toQuery(): string {
    return `${this.#fieldCode} ${this.#op} "${escapeStringLiteral(String(this.#value))}"`;
  }
}

function escapeStringLiteral(str: string): string {
  return str.replace(/"/g, '\\"');
}

type OrderByDirection = "asc" | "desc";
class Builder {
  #condisions: Condition<any>[] = [];
  #orderByList: { field: string; direction: OrderByDirection }[] = [];
  #limit: number | null = null;
  #offset: number | null = null;

  build(): string {
    const buf: string[] = [];
    if (this.#condisions.length > 0) {
      buf.push(...this.#condisions.map((condition) => condition.toQuery()));
    }
    if (this.#orderByList.length > 0) {
      buf.push("order by");
      const fields: string[] = [];
      this.#orderByList.forEach(({ field, direction }) => {
        fields.push(`${field} ${direction}`);
      });
      buf.push(fields.join(", "));
    }
    if (this.#limit != null) {
      buf.push(`limit ${this.#limit}`);
    }
    if (this.#offset != null) {
      buf.push(`offset ${this.#offset}`);
    }
    return buf.join(" ");
  }
  orderBy(field: string, direction: OrderByDirection): Builder {
    this.#orderByList.push({ field, direction });
    return this;
  }
  limit(numberOfRows: number): Builder {
    this.#limit = numberOfRows;
    return this;
  }
  offset(offset: number): Builder {
    this.#offset = offset;
    return this;
  }
  where(condition: Condition<any>): Builder {
    this.#condisions.push(condition);
    return this;
  }
}
