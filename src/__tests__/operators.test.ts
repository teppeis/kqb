import { LOGINUSER, NOW, PRIMARY_ORGANIZATION, TODAY } from "../functions";
import {
  AnyOperator,
  DateOperators,
  DateTimeOperators,
  NumericOperators,
  OrganizaionOperators,
  SelectionOperators,
  StatusOperators,
  StringOperators,
  TextOperators,
  TimeOperators,
  UserOperators,
} from "../operators";

describe("AnyOperator", () => {
  const operator = new AnyOperator("foo");
  test("has equal operators", () => {
    expect(operator.eq("1").toQuery()).toBe('foo = "1"');
    expect(operator.notEq("1").toQuery()).toBe('foo != "1"');
  });
  test("has inequal operators", () => {
    expect(operator.gt("1").toQuery()).toBe('foo > "1"');
    expect(operator.lt("1").toQuery()).toBe('foo < "1"');
    expect(operator.gtOrEq("1").toQuery()).toBe('foo >= "1"');
    expect(operator.ltOrEq("1").toQuery()).toBe('foo <= "1"');
  });
  test("has in operators", () => {
    expect(operator.in("1", "2").toQuery()).toBe('foo in ("1", "2")');
    expect(operator.notIn("1", "2").toQuery()).toBe('foo not in ("1", "2")');
  });
  test("has like operators", () => {
    expect(operator.like("bar").toQuery()).toBe('foo like "bar"');
    expect(operator.notLike("bar").toQuery()).toBe('foo not like "bar"');
  });
  test("doesn't have any other operators", () => {
    expect(() =>
      operator
        // @ts-expect-error
        .not_existing_operator("1")
    ).toThrow();
  });
});

describe("NumericOperators", () => {
  describe("at top level", () => {
    const operator = new NumericOperators[0]("foo");
    test("has equal, inequal and in operators", () => {
      expect(operator.eq("1").toQuery()).toBe('foo = "1"');
      expect(operator.gt("1").toQuery()).toBe('foo > "1"');
      expect(operator.in("1", "2").toQuery()).toBe('foo in ("1", "2")');
    });
    test("doesn't have like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .like("1")
      ).toThrow();
    });
    test("accepts a number value", () => {
      expect(operator.eq(1).toQuery()).toBe('foo = "1"');
    });
  });
  describe("in a table", () => {
    const operator = new NumericOperators[1]("foo");
    test("has inequal and in operators", () => {
      expect(operator.gt("1").toQuery()).toBe('foo > "1"');
      expect(operator.in("1", "2").toQuery()).toBe('foo in ("1", "2")');
    });
    test("doesn't have like and equal operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .like("1")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .eq("1")
      ).toThrow();
    });
  });
});

describe("TextOperators", () => {
  describe("at top level", () => {
    const operator = new TextOperators[0]("foo");
    test("has like operators", () => {
      expect(operator.like("bar").toQuery()).toBe('foo like "bar"');
    });
    test("doesn't have equal, inequal and in operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .in("bar")
      ).toThrow();
    });
  });
  describe("in a table", () => {
    test("same as TextOperator at top-level", () => {
      expect(TextOperators[1]).toBe(TextOperators[0]);
    });
  });
});

describe("StringOperators", () => {
  describe("at top level", () => {
    const operator = new StringOperators[0]("foo");
    test("has equal, in and like operators", () => {
      expect(operator.eq("bar").toQuery()).toBe('foo = "bar"');
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
      expect(operator.like("bar").toQuery()).toBe('foo like "bar"');
    });
    test("doesn't have inequal operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
    });
  });
  describe("in a table", () => {
    const operator = new StringOperators[1]("foo");
    test("has in and like operators", () => {
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
      expect(operator.like("bar").toQuery()).toBe('foo like "bar"');
    });
    test("doesn't have equal and inequal operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
    });
  });
});

describe("SelectionOperators", () => {
  describe("at top level", () => {
    const operator = new SelectionOperators[0]("foo");
    test("has in operators", () => {
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
    });
    test("doesn't have equal, inequal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like("bar")
      ).toThrow();
    });
  });
  describe("in a table", () => {
    test("same as SelectionOperators at top-level", () => {
      expect(SelectionOperators[1]).toBe(SelectionOperators[0]);
    });
  });
});

describe("UserOperators", () => {
  describe("at top level", () => {
    const operator = new UserOperators[0]("foo");
    test("has in operators", () => {
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
    });
    test("doesn't have equal, inequal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like("bar")
      ).toThrow();
    });
    test("accepts LOGINUSER()", () => {
      expect(operator.in(LOGINUSER()).toQuery()).toBe("foo in (LOGINUSER())");
      expect(operator.in().LOGINUSER().toQuery()).toBe("foo in (LOGINUSER())");
    });
  });
  describe("in a table", () => {
    test("same as UserOperators at top-level", () => {
      expect(UserOperators[1]).toBe(UserOperators[0]);
    });
  });
});

describe("OrganizaionOperators", () => {
  describe("at top level", () => {
    const operator = new OrganizaionOperators[0]("foo");
    test("has in operators", () => {
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
    });
    test("doesn't have equal, inequal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like("bar")
      ).toThrow();
    });
    test("accepts PRIMARY_ORGANIZATION()", () => {
      expect(operator.in(PRIMARY_ORGANIZATION()).toQuery()).toBe("foo in (PRIMARY_ORGANIZATION())");
      expect(operator.in().PRIMARY_ORGANIZATION().toQuery()).toBe(
        "foo in (PRIMARY_ORGANIZATION())"
      );
    });
  });
  describe("in a table", () => {
    test("same as OrganizaionOperators at top-level", () => {
      expect(OrganizaionOperators[1]).toBe(OrganizaionOperators[0]);
    });
  });
});

describe("StatusOperators", () => {
  describe("at top level", () => {
    const operator = new StatusOperators[0]("foo");
    test("has equal and in operators", () => {
      expect(operator.eq("bar").toQuery()).toBe('foo = "bar"');
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
    });
    test("doesn't have inequal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like("bar")
      ).toThrow();
    });
  });
  describe("in a table", () => {
    const operator = new StatusOperators[1]("foo");
    test("has in operators", () => {
      expect(operator.in("bar", "baz").toQuery()).toBe('foo in ("bar", "baz")');
    });
    test("doesn't have equal, inequal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .gt("bar")
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like("bar")
      ).toThrow();
    });
  });
});

describe("TimeOperators", () => {
  const value = "12:34";
  describe("at top level", () => {
    const operator = new TimeOperators[0]("foo");
    test("has equal and inequal operators", () => {
      expect(operator.eq(value).toQuery()).toBe('foo = "12:34"');
      expect(operator.gt(value).toQuery()).toBe('foo > "12:34"');
    });
    test("doesn't have in and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .in(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
  });
  describe("in a table", () => {
    const operator = new TimeOperators[1]("foo");
    test("has in and inequal operators", () => {
      expect(operator.in(value).toQuery()).toBe('foo in ("12:34")');
      expect(operator.gt(value).toQuery()).toBe('foo > "12:34"');
    });
    test("doesn't have equal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
  });
});

describe("DateTimeOperators", () => {
  const value = "2021-01-02T12:34Z";
  describe("at top level", () => {
    const operator = new DateTimeOperators[0]("foo");
    test("has equal and inequal operators", () => {
      expect(operator.eq(value).toQuery()).toBe('foo = "2021-01-02T12:34Z"');
      expect(operator.gt(value).toQuery()).toBe('foo > "2021-01-02T12:34Z"');
    });
    test("doesn't have in and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .in(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
    test("accepts query functions", () => {
      expect(operator.eq(NOW()).toQuery()).toBe("foo = NOW()");
      expect(operator.eq(TODAY()).toQuery()).toBe("foo = TODAY()");
    });
    test("accepts query functions with fluent chaining", () => {
      expect(operator.eq().NOW().toQuery()).toBe("foo = NOW()");
      expect(operator.eq().TODAY().toQuery()).toBe("foo = TODAY()");
      expect(operator.eq().YESTERDAY().toQuery()).toBe("foo = YESTERDAY()");
      expect(operator.eq().TOMORROW().toQuery()).toBe("foo = TOMORROW()");
      expect(operator.eq().FROM_TODAY(1, "DAYS").toQuery()).toBe("foo = FROM_TODAY(1, DAYS)");
      expect(operator.eq().LAST_WEEK().toQuery()).toBe("foo = LAST_WEEK()");
      expect(operator.eq().LAST_WEEK("FRIDAY").toQuery()).toBe("foo = LAST_WEEK(FRIDAY)");
      expect(operator.eq().THIS_WEEK().toQuery()).toBe("foo = THIS_WEEK()");
      expect(operator.eq().NEXT_WEEK().toQuery()).toBe("foo = NEXT_WEEK()");
      expect(operator.eq().LAST_MONTH().toQuery()).toBe("foo = LAST_MONTH()");
      expect(operator.eq().LAST_MONTH(1).toQuery()).toBe("foo = LAST_MONTH(1)");
      expect(operator.eq().LAST_MONTH("LAST").toQuery()).toBe("foo = LAST_MONTH(LAST)");
      expect(operator.eq().THIS_MONTH().toQuery()).toBe("foo = THIS_MONTH()");
      expect(operator.eq().NEXT_MONTH().toQuery()).toBe("foo = NEXT_MONTH()");
      expect(operator.eq().LAST_YEAR().toQuery()).toBe("foo = LAST_YEAR()");
      expect(operator.eq().THIS_YEAR().toQuery()).toBe("foo = THIS_YEAR()");
      expect(operator.eq().NEXT_YEAR().toQuery()).toBe("foo = NEXT_YEAR()");
    });
  });
  describe("in a table", () => {
    const operator = new DateTimeOperators[1]("foo");
    test("has in and inequal operators", () => {
      expect(operator.in(value).toQuery()).toBe('foo in ("2021-01-02T12:34Z")');
      expect(operator.gt(value).toQuery()).toBe('foo > "2021-01-02T12:34Z"');
    });
    test("doesn't have equal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
    test("accepts query functions", () => {
      expect(operator.in(NOW()).toQuery()).toBe("foo in (NOW())");
      expect(operator.in(TODAY()).toQuery()).toBe("foo in (TODAY())");
    });
    test("accepts query functions with fluent chaining", () => {
      expect(operator.in().NOW().toQuery()).toBe("foo in (NOW())");
      expect(operator.in().TODAY().toQuery()).toBe("foo in (TODAY())");
      expect(operator.in().YESTERDAY().toQuery()).toBe("foo in (YESTERDAY())");
      expect(operator.in().TOMORROW().toQuery()).toBe("foo in (TOMORROW())");
      expect(operator.in().FROM_TODAY(1, "DAYS").toQuery()).toBe("foo in (FROM_TODAY(1, DAYS))");
      expect(operator.in().LAST_WEEK().toQuery()).toBe("foo in (LAST_WEEK())");
      expect(operator.in().LAST_WEEK("FRIDAY").toQuery()).toBe("foo in (LAST_WEEK(FRIDAY))");
      expect(operator.in().THIS_WEEK().toQuery()).toBe("foo in (THIS_WEEK())");
      expect(operator.in().NEXT_WEEK().toQuery()).toBe("foo in (NEXT_WEEK())");
      expect(operator.in().LAST_MONTH().toQuery()).toBe("foo in (LAST_MONTH())");
      expect(operator.in().LAST_MONTH(1).toQuery()).toBe("foo in (LAST_MONTH(1))");
      expect(operator.in().LAST_MONTH("LAST").toQuery()).toBe("foo in (LAST_MONTH(LAST))");
      expect(operator.in().THIS_MONTH().toQuery()).toBe("foo in (THIS_MONTH())");
      expect(operator.in().NEXT_MONTH().toQuery()).toBe("foo in (NEXT_MONTH())");
      expect(operator.in().LAST_YEAR().toQuery()).toBe("foo in (LAST_YEAR())");
      expect(operator.in().THIS_YEAR().toQuery()).toBe("foo in (THIS_YEAR())");
      expect(operator.in().NEXT_YEAR().toQuery()).toBe("foo in (NEXT_YEAR())");
    });
  });
});

describe("DateOperators", () => {
  const value = "2021-01-02";
  describe("at top level", () => {
    const operator = new DateOperators[0]("foo");
    test("has equal and inequal operators", () => {
      expect(operator.eq(value).toQuery()).toBe('foo = "2021-01-02"');
      expect(operator.gt(value).toQuery()).toBe('foo > "2021-01-02"');
    });
    test("doesn't have in and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .in(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
    test("accepts query functions", () => {
      expect(operator.eq(TODAY()).toQuery()).toBe("foo = TODAY()");
    });
    test("accepts query functions with fluent chaining", () => {
      expect(operator.eq().TODAY().toQuery()).toBe("foo = TODAY()");
    });
    test("doesn't accept NOW()", () => {
      operator.eq(
        // @ts-expect-error
        NOW()
      );
      expect(() =>
        operator
          .eq()
          // @ts-expect-error
          .NOW()
      ).toThrow();
    });
  });
  describe("in a table", () => {
    const operator = new DateOperators[1]("foo");
    test("has in and inequal operators", () => {
      expect(operator.in(value).toQuery()).toBe('foo in ("2021-01-02")');
      expect(operator.gt(value).toQuery()).toBe('foo > "2021-01-02"');
    });
    test("doesn't have equal and like operators", () => {
      expect(() =>
        operator
          // @ts-expect-error
          .eq(value)
      ).toThrow();
      expect(() =>
        operator
          // @ts-expect-error
          .like(value)
      ).toThrow();
    });
    test("accepts query functions", () => {
      expect(operator.in(TODAY()).toQuery()).toBe("foo in (TODAY())");
    });
    test("accepts query functions with fluent chaining", () => {
      expect(operator.in().TODAY().toQuery()).toBe("foo in (TODAY())");
    });
  });
});
