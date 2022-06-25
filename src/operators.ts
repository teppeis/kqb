import { InCondition, SingleCondition } from "./conditions";
import * as funcs from "./functions";
import type {
  AnyFunctions,
  DateFunctions,
  DateTimeFunctions,
  Day,
  FromTodayUnit,
  OrganizationFunctions,
  UserFunctions,
} from "./functions-internal";
import {
  DateFunctionNames,
  DateTimeFunctionNames,
  OrganizationFunctionNames,
  QueryFunctionNames,
  UserFunctionNames,
} from "./functions-internal";

type Class<ConstructorArgs extends any[], InstanceType> = {
  new (...args: ConstructorArgs): InstanceType;
};

type OperatorBaseConstructorArgs<Q extends QueryFunctionNames = QueryFunctionNames> = [
  fieldCode: string,
  queryFunctionNames: readonly Q[] | undefined
];

function mixin<
  MixinInstance1 extends OperatorBase,
  MixinInstance2 extends OperatorBase = OperatorBase,
  MixinInstance3 extends OperatorBase = OperatorBase,
  MixinInstance4 extends OperatorBase = OperatorBase
>(
  Mixin1: Class<OperatorBaseConstructorArgs<never>, MixinInstance1>,
  Mixin2?: Class<OperatorBaseConstructorArgs<never>, MixinInstance2>,
  Mixin3?: Class<OperatorBaseConstructorArgs<never>, MixinInstance3>,
  Mixin4?: Class<OperatorBaseConstructorArgs<never>, MixinInstance4>
): Class<
  [fieldCode: string],
  OperatorBase & MixinInstance1 & MixinInstance2 & MixinInstance3 & MixinInstance4
> {
  return mixinWithQueryFunctions<
    never,
    MixinInstance1,
    MixinInstance2,
    MixinInstance3,
    MixinInstance4
  >([], Mixin1, Mixin2, Mixin3, Mixin4);
}

function mixinWithQueryFunctions<
  Q extends QueryFunctionNames,
  MixinInstance1 extends OperatorBase,
  MixinInstance2 extends OperatorBase = OperatorBase,
  MixinInstance3 extends OperatorBase = OperatorBase,
  MixinInstance4 extends OperatorBase = OperatorBase
>(
  queryFunctionNames: readonly Q[],
  Mixin1: Class<OperatorBaseConstructorArgs<Q>, MixinInstance1>,
  Mixin2?: Class<OperatorBaseConstructorArgs<Q>, MixinInstance2>,
  Mixin3?: Class<OperatorBaseConstructorArgs<Q>, MixinInstance3>,
  Mixin4?: Class<OperatorBaseConstructorArgs<Q>, MixinInstance4>
): Class<
  [fieldCode: string],
  OperatorBase & MixinInstance1 & MixinInstance2 & MixinInstance3 & MixinInstance4
> {
  class Mixed {
    constructor(fieldCode: string) {
      const base = new OperatorBase(fieldCode, queryFunctionNames);
      const Mixins = [Mixin1, Mixin2, Mixin3, Mixin4];
      Mixins.forEach((Mixin) => {
        if (!Mixin) {
          return;
        }
        const allProps = Object.getOwnPropertyDescriptors<any>(Mixin.prototype);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { constructor, ...props } = allProps;
        // Work around for TS 4.6+ bug . This will be fixed in TS 4.8 beta.
        const props2: {
          [x: string]: TypedPropertyDescriptor<any> & PropertyDescriptor;
        } = props;
        Object.defineProperties(base, props2);
      });
      return base;
    }
  }
  return Mixed as any;
}

class OperatorBase<Q extends QueryFunctionNames = QueryFunctionNames> {
  readonly #field: string;
  readonly #queryFunctionNames: readonly Q[];
  constructor(fieldCode: string, queryFunctionNames: readonly Q[] = []) {
    this.#field = fieldCode;
    this.#queryFunctionNames = queryFunctionNames;
  }
  protected singleCondition<Value>(op: string, value: Value) {
    return new SingleCondition<Value>(this.#field, op, value);
  }
  protected singleConditionWithQueryFunctions<Value>(op: string, value?: Value) {
    if (value === undefined) {
      const functions = queryFunctionsSingle(this.#field, op);
      return Object.fromEntries(
        Object.entries(functions).filter(([func]) =>
          this.#queryFunctionNames.includes(func as any)
        )
      );
    } else {
      return this.singleCondition(op, value);
    }
  }
  protected inCondition<Value>(op: "in" | "not in", values: Value[]) {
    return new InCondition(this.#field, op, values);
  }
  protected inConditionWithQueryFunctions<Value>(op: "in" | "not in", values: Value[]) {
    if (values.length === 0) {
      const functions = queryFunctionsIn(this.#field, op);
      return Object.fromEntries(
        Object.entries(functions).filter(([func]) =>
          this.#queryFunctionNames.includes(func as any)
        )
      );
    } else {
      return this.inCondition(op, values);
    }
  }
}

function queryFunctionsSingle(field: string, op: string) {
  return {
    LOGINUSER: () => new SingleCondition(field, op, funcs.LOGINUSER()),
    PRIMARY_ORGANIZATION: () =>
      new SingleCondition(field, op, funcs.PRIMARY_ORGANIZATION()),
    NOW: () => new SingleCondition(field, op, funcs.NOW()),
    TODAY: () => new SingleCondition(field, op, funcs.TODAY()),
    YESTERDAY: () => new SingleCondition(field, op, funcs.YESTERDAY()),
    TOMORROW: () => new SingleCondition(field, op, funcs.TOMORROW()),
    FROM_TODAY: (num: number, unit: FromTodayUnit) =>
      new SingleCondition(field, op, funcs.FROM_TODAY(num, unit)),
    THIS_WEEK: (day?: Day) => new SingleCondition(field, op, funcs.THIS_WEEK(day)),
    LAST_WEEK: (day?: Day) => new SingleCondition(field, op, funcs.LAST_WEEK(day)),
    NEXT_WEEK: (day?: Day) => new SingleCondition(field, op, funcs.NEXT_WEEK(day)),
    THIS_MONTH: (date?: "LAST" | number) =>
      new SingleCondition(field, op, funcs.THIS_MONTH(date)),
    LAST_MONTH: (date?: "LAST" | number) =>
      new SingleCondition(field, op, funcs.LAST_MONTH(date)),
    NEXT_MONTH: (date?: "LAST" | number) =>
      new SingleCondition(field, op, funcs.NEXT_MONTH(date)),
    THIS_YEAR: () => new SingleCondition(field, op, funcs.THIS_YEAR()),
    LAST_YEAR: () => new SingleCondition(field, op, funcs.LAST_YEAR()),
    NEXT_YEAR: () => new SingleCondition(field, op, funcs.NEXT_YEAR()),
  } as const;
}

function queryFunctionsIn(field: string, op: "in" | "not in") {
  return {
    LOGINUSER: () => new InCondition(field, op, [funcs.LOGINUSER()]),
    PRIMARY_ORGANIZATION: () =>
      new InCondition(field, op, [funcs.PRIMARY_ORGANIZATION()]),
    NOW: () => new InCondition(field, op, [funcs.NOW()]),
    TODAY: () => new InCondition(field, op, [funcs.TODAY()]),
    YESTERDAY: () => new InCondition(field, op, [funcs.YESTERDAY()]),
    TOMORROW: () => new InCondition(field, op, [funcs.TOMORROW()]),
    FROM_TODAY: (num: number, unit: FromTodayUnit) =>
      new InCondition(field, op, [funcs.FROM_TODAY(num, unit)]),
    THIS_WEEK: (day?: Day) => new InCondition(field, op, [funcs.THIS_WEEK(day)]),
    LAST_WEEK: (day?: Day) => new InCondition(field, op, [funcs.LAST_WEEK(day)]),
    NEXT_WEEK: (day?: Day) => new InCondition(field, op, [funcs.NEXT_WEEK(day)]),
    THIS_MONTH: (date?: "LAST" | number) =>
      new InCondition(field, op, [funcs.THIS_MONTH(date)]),
    LAST_MONTH: (date?: "LAST" | number) =>
      new InCondition(field, op, [funcs.LAST_MONTH(date)]),
    NEXT_MONTH: (date?: "LAST" | number) =>
      new InCondition(field, op, [funcs.NEXT_MONTH(date)]),
    THIS_YEAR: () => new InCondition(field, op, [funcs.THIS_YEAR()]),
    LAST_YEAR: () => new InCondition(field, op, [funcs.LAST_YEAR()]),
    NEXT_YEAR: () => new InCondition(field, op, [funcs.NEXT_YEAR()]),
  } as const;
}

class EqualOperatorMixin<Value> extends OperatorBase {
  /**
   * `=` operator
   */
  eq(value: Value) {
    return this.singleCondition("=", value);
  }
  /**
   * `!=` operator
   */
  notEq(value: Value) {
    return this.singleCondition("!=", value);
  }
}

class EqualOperatorMixinWithFunction<
  Value,
  Q extends QueryFunctionNames
> extends OperatorBase<Q> {
  /**
   * `=` operator
   */
  eq(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  eq(value: Value): SingleCondition<Value>;
  eq(value?: Value) {
    return this.singleConditionWithQueryFunctions("=", value);
  }
  /**
   * `!=` operator
   */
  notEq(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  notEq(value: Value): SingleCondition<Value>;
  notEq(value?: Value) {
    return this.singleConditionWithQueryFunctions("!=", value);
  }
}

class InequalOperatorMixin<Value> extends OperatorBase {
  /**
   * `>` operator
   */
  gt(value: Value) {
    return this.singleCondition(">", value);
  }
  /**
   * `<` operator
   */
  lt(value: Value) {
    return this.singleCondition("<", value);
  }
  /**
   * `>=` operator
   */
  gtOrEq(value: Value) {
    return this.singleCondition(">=", value);
  }
  /**
   * `<=` operator
   */
  ltOrEq(value: Value) {
    return this.singleCondition("<=", value);
  }
}
class InequalOperatorMixinWithFunction<
  Value,
  Q extends QueryFunctionNames
> extends OperatorBase<Q> {
  /**
   * `>` operator
   */
  gt(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  gt(value: Value): SingleCondition<Value>;
  gt(value?: Value) {
    return this.singleConditionWithQueryFunctions(">", value);
  }
  /**
   * `<` operator
   */
  lt(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  lt(value: Value): SingleCondition<Value>;
  lt(value?: Value) {
    return this.singleConditionWithQueryFunctions("<", value);
  }
  /**
   * `>=` operator
   */
  gtOrEq(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  gtOrEq(value: Value): SingleCondition<Value>;
  gtOrEq(value?: Value) {
    return this.singleConditionWithQueryFunctions(">=", value);
  }
  /**
   * `<=` operator
   */
  ltOrEq(): Pick<ReturnType<typeof queryFunctionsSingle>, Q>;
  ltOrEq(value: Value): SingleCondition<Value>;
  ltOrEq(value?: Value) {
    return this.singleConditionWithQueryFunctions("<=", value);
  }
}

class LikeOperatorMixin extends OperatorBase {
  /**
   * `like` operator
   */
  like(value: string) {
    return this.singleCondition("like", value);
  }
  /**
   * `not like` operator
   */
  notLike(value: string) {
    return this.singleCondition("not like", value);
  }
}
class InOperatorMixin<Value> extends OperatorBase {
  /**
   * `in` operator
   */
  in(value: Value, ...values: Value[]) {
    return this.inCondition("in", [value, ...values]);
  }
  /**
   * not `in` operator
   */
  notIn(value: Value, ...values: Value[]) {
    return this.inCondition("not in", [value, ...values]);
  }
}

class InOperatorMixinWithFunction<
  Value,
  Q extends QueryFunctionNames
> extends OperatorBase<Q> {
  /**
   * `in` operator
   */
  in(): Pick<ReturnType<typeof queryFunctionsIn>, Q>;
  in(value: Value, ...values: Value[]): InCondition<Value>;
  in(...values: Value[]) {
    return this.inConditionWithQueryFunctions("in", values);
  }
  /**
   * not `in` operator
   */
  notIn(): Pick<ReturnType<typeof queryFunctionsIn>, Q>;
  notIn(value: Value, ...values: Value[]): InCondition<Value>;
  notIn(...values: Value[]) {
    return this.inConditionWithQueryFunctions("not in", values);
  }
}

const NumericOperator = mixin<
  EqualOperatorMixin<string | number>,
  InequalOperatorMixin<string | number>,
  InOperatorMixin<string | number>
>(EqualOperatorMixin, InequalOperatorMixin, InOperatorMixin);

const NumericOperatorForTable = mixin<
  InequalOperatorMixin<string | number>,
  InOperatorMixin<string | number>
>(InequalOperatorMixin, InOperatorMixin);

export const NumericOperators = [NumericOperator, NumericOperatorForTable] as const;

const StringOperator = mixin<
  EqualOperatorMixin<string>,
  InOperatorMixin<string>,
  LikeOperatorMixin
>(EqualOperatorMixin, InOperatorMixin, LikeOperatorMixin);

const StringOperatorForTable = mixin<InOperatorMixin<string>, LikeOperatorMixin>(
  InOperatorMixin,
  LikeOperatorMixin
);

export const StringOperators = [StringOperator, StringOperatorForTable] as const;

const TextOperator = mixin<LikeOperatorMixin>(LikeOperatorMixin);
export const TextOperators = [TextOperator, TextOperator] as const;

function createSelectionOperator<T>() {
  const SelectionOperator = mixin<InOperatorMixin<T>>(InOperatorMixin);
  return [SelectionOperator, SelectionOperator] as const;
}
export const SelectionOperators = createSelectionOperator<string>();

function createSelectionOperatorWithFunction<T, Q extends QueryFunctionNames>(
  queryFunctionNames: readonly Q[]
) {
  const SelectionOperator = mixinWithQueryFunctions<Q, InOperatorMixinWithFunction<T, Q>>(
    queryFunctionNames,
    InOperatorMixinWithFunction
  );
  return [SelectionOperator, SelectionOperator] as const;
}
export const UserOperators = createSelectionOperatorWithFunction<
  string | UserFunctions,
  UserFunctionNames
>(UserFunctionNames);
export const OrganizaionOperators = createSelectionOperatorWithFunction<
  string | OrganizationFunctions,
  OrganizationFunctionNames
>(OrganizationFunctionNames);

const StatusOperator = mixin<EqualOperatorMixin<string>, InOperatorMixin<string>>(
  EqualOperatorMixin,
  InOperatorMixin
);

// NOTE: not in use
const StatusOperatorForTable = mixin<InOperatorMixin<string>>(InOperatorMixin);

export const StatusOperators = [StatusOperator, StatusOperatorForTable] as const;

function createTimeOperator<T>() {
  const TimeOperator = mixin<EqualOperatorMixin<T>, InequalOperatorMixin<T>>(
    EqualOperatorMixin,
    InequalOperatorMixin
  );

  const TimeOperatorForTable = mixin<InOperatorMixin<T>, InequalOperatorMixin<T>>(
    InOperatorMixin,
    InequalOperatorMixin
  );

  return [TimeOperator, TimeOperatorForTable] as const;
}
export const TimeOperators = createTimeOperator<string>();

function createDateTimeOperator<T, Q extends QueryFunctionNames>(
  queryFunctionNames: readonly Q[]
) {
  const DateTimeOperator = mixinWithQueryFunctions<
    Q,
    EqualOperatorMixinWithFunction<T, Q>,
    InequalOperatorMixinWithFunction<T, Q>
  >(queryFunctionNames, EqualOperatorMixinWithFunction, InequalOperatorMixinWithFunction);

  const DateTimeOperatorForTable = mixinWithQueryFunctions<
    Q,
    InOperatorMixinWithFunction<T, Q>,
    InequalOperatorMixinWithFunction<T, Q>
  >(queryFunctionNames, InOperatorMixinWithFunction, InequalOperatorMixinWithFunction);

  return [DateTimeOperator, DateTimeOperatorForTable] as const;
}
export const DateTimeOperators = createDateTimeOperator<
  string | DateTimeFunctions,
  DateTimeFunctionNames
>(DateTimeFunctionNames);
export const DateOperators = createDateTimeOperator<
  string | DateFunctions,
  DateFunctionNames
>(DateFunctionNames);

export const AnyOperator = mixinWithQueryFunctions<
  QueryFunctionNames,
  EqualOperatorMixinWithFunction<string | AnyFunctions, QueryFunctionNames>,
  InequalOperatorMixinWithFunction<string | AnyFunctions, QueryFunctionNames>,
  InOperatorMixinWithFunction<string | AnyFunctions, QueryFunctionNames>,
  LikeOperatorMixin
>(
  QueryFunctionNames,
  EqualOperatorMixinWithFunction,
  InequalOperatorMixinWithFunction,
  InOperatorMixinWithFunction,
  LikeOperatorMixin
);
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
  ORGANIZATION_SELECT: OrganizaionOperators,
  RADIO_BUTTON: SelectionOperators,
  RECORD_NUMBER: NumericOperators,
  RICH_TEXT: TextOperators,
  SINGLE_LINE_TEXT: StringOperators,
  STATUS: StatusOperators,
  STATUS_ASSIGNEE: UserOperators,
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
