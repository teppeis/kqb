type AssertEqual<T, U> = (<G>() => G extends T ? 1 : 2) extends <G>() => G extends U
  ? 1
  : 2
  ? T
  : never;
export function assertExactType<T, U>(draft: T & AssertEqual<T, U>, expected?: U): void {}

/**
 * Returns a dummy condition for testing
 */
export function eq(field = "foo", value = "bar") {
  return condition(field, "=", value);
}

/**
 * Returns a dummy condition for testing
 */
export function condition(field: string, op: string, value: string) {
  return {
    toQuery() {
      return `${field} ${op} "${value}"`;
    },
  };
}
