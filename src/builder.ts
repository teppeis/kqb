import type { Condition } from "./conditions";
import type { FieldTypeOperators } from "./operators";

export type FieldTypes = keyof FieldTypeOperators;
export type Subtable = { $type: "SUBTABLE"; $fields: Record<string, FieldTypes> };
export type FieldDefinitionsTypes = Record<string, FieldTypes | Subtable>;

// TODO: fields in a reference field are not sortable
type SortableFieldTypes =
  | "RECORD_NUMBER"
  | "MODIFIER"
  | "CREATOR"
  | "UPDATED_TIME"
  | "CREATED_TIME"
  | "SINGLE_LINE_TEXT"
  | "NUMBER"
  | "CALC"
  | "DROP_DOWN"
  | "RADIO_BUTTON"
  | "DATE"
  | "TIME"
  | "DATETIME"
  | "LINK"
  | "STATUS";
type OrderByTargetFieldNames<T> = {
  [K in keyof T]: T[K] extends SortableFieldTypes ? K : never;
}[keyof T];
type OrderByDirection = "asc" | "desc";
type OrderByTargetPair<FieldDefs> = [
  field: OrderByTargetFieldNames<FieldDefs>,
  direction: OrderByDirection
];

export class Builder<FieldDefs extends FieldDefinitionsTypes> {
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
