import { InCondition, SingleCondition } from "./conditions";
import type {
  AnyFunctions,
  DateFunctions,
  DatetimeFunctions,
  UserFunctions,
} from "./functions-internal";

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

export class OperatorBase {
  #field: string;
  constructor(fieldCode: string) {
    this.#field = fieldCode;
  }
  getField() {
    return this.#field;
  }
}

export class EqualOperatorMixin<T> extends OperatorBase {
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

export class InequalOperatorMixin<T> extends OperatorBase {
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

export class LikeOperatorMixin extends OperatorBase {
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

export class InOperatorMixin<T> extends OperatorBase {
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

const NumericOperatorForTable = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  InequalOperatorMixin<string | number>,
  InOperatorMixin<string | number>
>(OperatorBase, InequalOperatorMixin, InOperatorMixin);

const NumericOperators = [NumericOperator, NumericOperatorForTable] as const;

const StringOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(OperatorBase, EqualOperatorMixin, InOperatorMixin, LikeOperatorMixin);

const StringOperatorForTable = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(OperatorBase, InOperatorMixin, LikeOperatorMixin);

const StringOperators = [StringOperator, StringOperatorForTable] as const;

const TextOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  LikeOperatorMixin
>(OperatorBase, LikeOperatorMixin);

const TextOperators = [TextOperator, TextOperator] as const;

function createSelectionOperator<T>() {
  const SelectionOperator = mixin<
    ConstructorParameters<typeof OperatorBase>,
    OperatorBase,
    InOperatorMixin<T>
  >(OperatorBase, InOperatorMixin);
  return [SelectionOperator, SelectionOperator] as const;
}
const SelectionOperators = createSelectionOperator<string>();
const UserOperators = createSelectionOperator<string | UserFunctions>();

const StatusOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InOperatorMixin<string>
>(OperatorBase, EqualOperatorMixin, InOperatorMixin);

// NOTE: not in use
const StatusOperatorForTable = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  InOperatorMixin<string>
>(OperatorBase, InOperatorMixin);

const StatusOperators = [StatusOperator, StatusOperatorForTable] as const;

function createDateTimeOperator<T>() {
  const DateTimeOperator = mixin<
    ConstructorParameters<typeof OperatorBase>,
    OperatorBase,
    EqualOperatorMixin<T>,
    InequalOperatorMixin<T>
  >(OperatorBase, EqualOperatorMixin, InequalOperatorMixin);

  const DateTimeOperatorForTable = mixin<
    ConstructorParameters<typeof OperatorBase>,
    OperatorBase,
    InOperatorMixin<T>,
    InequalOperatorMixin<T>
  >(OperatorBase, InOperatorMixin, InequalOperatorMixin);

  return [DateTimeOperator, DateTimeOperatorForTable] as const;
}
const TimeOperators = createDateTimeOperator<string>();
const DateTimeOperators = createDateTimeOperator<string | DatetimeFunctions>();
const DateOperators = createDateTimeOperator<string | DateFunctions>();

export const AnyOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string | AnyFunctions>,
  InequalOperatorMixin<string | AnyFunctions>,
  InOperatorMixin<string | AnyFunctions>,
  LikeOperatorMixin
>(OperatorBase, EqualOperatorMixin, InequalOperatorMixin, InOperatorMixin, LikeOperatorMixin);
export type AnyOperator = InstanceType<typeof AnyOperator>;

export const FieldTypeOperators = {
  CALC: NumericOperators,
  CHECK_BOX: SelectionOperators,
  CREATED_TIME: DateTimeOperators,
  CREATOR: UserOperators,
  DATE: DateOperators,
  DATETIME: DateTimeOperators,
  DROP_DOWN: SelectionOperators,
  FILE: TextOperators,
  GROUP_SELECT: SelectionOperators,
  LINK: StringOperators,
  MODIFIER: UserOperators,
  MULTI_LINE_TEXT: TextOperators,
  MULTI_SELECT: SelectionOperators,
  NUMBER: NumericOperators,
  ORGANIZATION_SELECT: SelectionOperators,
  RADIO_BUTTON: SelectionOperators,
  RECORD_NUMBER: NumericOperators,
  RICH_TEXT: TextOperators,
  SINGLE_LINE_TEXT: StringOperators,
  STATUS: StatusOperators,
  STATUS_ASSIGNEE: SelectionOperators,
  TIME: TimeOperators,
  UPDATED_TIME: DateTimeOperators,
  USER_SELECT: UserOperators,
} as const;

export type FieldTypeOperators = {
  [K in keyof typeof FieldTypeOperators]: [
    InstanceType<typeof FieldTypeOperators[K][0]>,
    InstanceType<typeof FieldTypeOperators[K][1]>
  ];
};
