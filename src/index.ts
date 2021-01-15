export const createBuilder = () => ({
  builder: new Builder(),
  field: conditionCreator,
});

function conditionCreator<T = string>(fieldCode: string) {
  return new Operator<T>(fieldCode);
}

class Operator<T = string> {
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
  like(value: T): Condition<T> {
    return new Condition(this.#field, "like", value);
  }
  notLike(value: T): Condition<T> {
    return new Condition(this.#field, "not like", value);
  }
}

class Condition<T = string> {
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
  #condisions: Condition[] = [];
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
  where(condition: Condition): Builder {
    this.#condisions.push(condition);
    return this;
  }
}

interface Condition {}
