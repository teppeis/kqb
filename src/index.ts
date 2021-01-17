type Class<ConstructorArgs extends any[], InstanceType> = {
  new (...args: ConstructorArgs): InstanceType;
};

function mixin<
  ConstructorArgs extends any[],
  BaseInstance,
  MixinInstance1 extends BaseInstance,
  MixinInstance2 extends BaseInstance = BaseInstance,
  MixinInstance3 extends BaseInstance = BaseInstance,
  MixinInstance4 extends BaseInstance = BaseInstance
>(
  Base: Class<ConstructorArgs, BaseInstance>,
  Mixin1: Class<ConstructorArgs, MixinInstance1>,
  Mixin2?: Class<ConstructorArgs, MixinInstance2>,
  Mixin3?: Class<ConstructorArgs, MixinInstance3>,
  Mixin4?: Class<ConstructorArgs, MixinInstance4>
): Class<
  ConstructorArgs,
  BaseInstance & MixinInstance1 & MixinInstance2 & MixinInstance3 & MixinInstance4
> {
  class Mixed {
    constructor(...args: any) {
      const base = new Base(...args);
      const Mixins = [Mixin1, Mixin2, Mixin3, Mixin4];
      Mixins.forEach((Mixin) => {
        if (!Mixin) {
          return;
        }
        const allProps = Object.getOwnPropertyDescriptors(Mixin.prototype);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { constructor, ...props } = allProps;
        Object.defineProperties(base, props);
      });
      return base;
    }
  }
  return Mixed as any;
}
class OperatorBase {
  #field: string;
  constructor(fieldCode: string) {
    this.#field = fieldCode;
  }
  getField() {
    return this.#field;
  }
}

class EqualOperatorMixin<T> extends OperatorBase {
  /**
   * `=` operator
   */
  eq(value: T) {
    return new SingleCondition(this.getField(), "=", value);
  }
  /**
   * `!=` operator
   */
  notEq(value: T) {
    return new SingleCondition(this.getField(), "!=", value);
  }
}
class InequalOperatorMixin<T> extends OperatorBase {
  /**
   * `>` operator
   */
  gt(value: T) {
    return new SingleCondition(this.getField(), ">", value);
  }
  /**
   * `<` operator
   */
  lt(value: T) {
    return new SingleCondition(this.getField(), "<", value);
  }
  /**
   * `>=` operator
   */
  gtOrEq(value: T) {
    return new SingleCondition(this.getField(), ">=", value);
  }
  /**
   * `<=` operator
   */
  ltOrEq(value: T) {
    return new SingleCondition(this.getField(), "<=", value);
  }
}

class LikeOperatorMixin extends OperatorBase {
  /**
   * `like` operator
   */
  like(value: string) {
    return new SingleCondition(this.getField(), "like", value);
  }
  /**
   * `not like` operator
   */
  notLike(value: string) {
    return new SingleCondition(this.getField(), "not like", value);
  }
}

class InOperatorMixin<T> extends OperatorBase {
  /**
   * `in` operator
   */
  in(value: T, ...values: T[]) {
    return new InCondition(this.getField(), "in", [value, ...values]);
  }
  /**
   * not `in` operator
   */
  notIn(value: T, ...values: T[]) {
    return new InCondition(this.getField(), "not in", [value, ...values]);
  }
}

const NumericOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string | number>,
  InequalOperatorMixin<string | number>,
  InOperatorMixin<string | number>
>(OperatorBase, EqualOperatorMixin, InequalOperatorMixin, InOperatorMixin);

const StringOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(OperatorBase, EqualOperatorMixin, InOperatorMixin, LikeOperatorMixin);

const TextOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  LikeOperatorMixin
>(OperatorBase, LikeOperatorMixin);

const SelectionOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  InOperatorMixin<string>
>(OperatorBase, InOperatorMixin);

const StatusOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InOperatorMixin<string>
>(OperatorBase, EqualOperatorMixin, InOperatorMixin);

const DateTimeOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InequalOperatorMixin<string>
>(OperatorBase, EqualOperatorMixin, InequalOperatorMixin);

const AnyOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InequalOperatorMixin<string>,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(OperatorBase, EqualOperatorMixin, InequalOperatorMixin, InOperatorMixin, LikeOperatorMixin);
type AnyOperator = InstanceType<typeof AnyOperator>;

const FieldTypeOperators = {
  CALC: NumericOperator,
  CHECK_BOX: SelectionOperator,
  CREATED_TIME: DateTimeOperator,
  CREATOR: SelectionOperator,
  DATE: DateTimeOperator,
  DATETIME: DateTimeOperator,
  DROP_DOWN: SelectionOperator,
  FILE: TextOperator,
  GROUP_SELECT: SelectionOperator,
  LINK: StringOperator,
  MODIFIER: SelectionOperator,
  MULTI_LINE_TEXT: TextOperator,
  MULTI_SELECT: SelectionOperator,
  NUMBER: NumericOperator,
  ORGANIZATION_SELECT: SelectionOperator,
  RADIO_BUTTON: SelectionOperator,
  RECORD_NUMBER: NumericOperator,
  RICH_TEXT: TextOperator,
  SINGLE_LINE_TEXT: StringOperator,
  STATUS: StatusOperator,
  STATUS_ASSIGNEE: SelectionOperator,
  TIME: DateTimeOperator,
  UPDATED_TIME: DateTimeOperator,
  USER_SELECT: SelectionOperator,
};
type FieldTypeOperators = {
  [K in keyof typeof FieldTypeOperators]: InstanceType<typeof FieldTypeOperators[K]>;
};

const BuiltinField = { $id: "RECORD_NUMBER" } as const;
type StringKeyOf<T> = Extract<keyof T, string>;
type FieldDefinitionsTypes = Record<string, keyof FieldTypeOperators>;

export function createBuilder<FieldDefs extends FieldDefinitionsTypes = any>(fd?: FieldDefs) {
  type MergedDefs = FieldDefs & typeof BuiltinField;
  return {
    builder: new Builder<MergedDefs>(),
    field: <FieldCode extends StringKeyOf<MergedDefs>>(fieldCode: FieldCode) => {
      return (fd
        ? new FieldTypeOperators[{ ...fd, ...BuiltinField }[fieldCode]](fieldCode)
        : new AnyOperator(fieldCode)) as string extends StringKeyOf<FieldDefs>
        ? AnyOperator
        : FieldTypeOperators[MergedDefs[FieldCode]];
    },
  };
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
