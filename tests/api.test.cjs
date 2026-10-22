const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const app = require("../dist/app").default;
const server = app.listen(0, "127.0.0.1");
after(() => new Promise((resolve) => server.close(resolve)));
async function request(path, options) {
  if (!server.listening)
    await new Promise((resolve) => server.once("listening", resolve));
  return fetch(`http://127.0.0.1:${server.address().port}${path}`, options);
}
test("health and endpoint directory respond", async () => {
  assert.equal((await request("/health")).status, 200);
  assert.equal((await request("/api")).status, 200);
  assert.equal((await request("/ready")).status, 503);
  assert.equal((await request("/unknown")).status, 404);
});
test("invalid identifiers and pagination are rejected before querying", async () => {
  for (const path of [
    "/users/no",
    "/products/0",
    "/users/2147483648",
    "/users?page=abc",
    "/products?limit=101",
    "/users?page=1&page=2",
  ]) {
    assert.equal((await request("/api/v1" + path)).status, 400, path);
  }
});
test("invalid bodies return actionable errors", async () => {
  for (const [path, method, body, expected] of [
    ["/users", "POST", "{", 400],
    ["/users", "POST", "{}", 422],
    ["/users/1", "PUT", "{}", 422],
    ["/products/1", "PUT", '{"unknown":1}', 422],
    [
      "/products",
      "POST",
      '{"name":"  ","productCategoryId":1,"productSituationId":1}',
      422,
    ],
  ]) {
    assert.equal(
      (
        await request("/api/v1" + path, {
          method,
          headers: { "Content-Type": "application/json" },
          body,
        })
      ).status,
      expected,
    );
  }
});
