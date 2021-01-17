import { InCondition, SingleCondition } from "./conditions";

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

export const AnyOperator = mixin<
  ConstructorParameters<typeof OperatorBase>,
  OperatorBase,
  EqualOperatorMixin<string>,
  InequalOperatorMixin<string>,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(OperatorBase, EqualOperatorMixin, InequalOperatorMixin, InOperatorMixin, LikeOperatorMixin);
export type AnyOperator = InstanceType<typeof AnyOperator>;

export const FieldTypeOperators = {
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
export type FieldTypeOperators = {
  [K in keyof typeof FieldTypeOperators]: InstanceType<typeof FieldTypeOperators[K]>;
};
