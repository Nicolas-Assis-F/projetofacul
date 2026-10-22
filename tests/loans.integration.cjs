const { test } = require("node:test");
const assert = require("node:assert/strict");
const { AppDataSource: db } = require("../dist/config/database");
const { Loan } = require("../dist/entities/Loan");
const app = require("../dist/app").default;

test("loan lifecycle, concurrent checkout, eligibility and history protection", async () => {
  if (!process.env.DATABASE_URL || process.env.TEST_DATABASE !== "true")
    throw new Error("Use an isolated database with TEST_DATABASE=true");
  await db.initialize();
  const server = app.listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  const people = [],
    products = [],
    loans = [];
  async function request(path, method = "GET", body) {
    const response = await fetch(
      `http://127.0.0.1:${server.address().port}/api/v1${path}`,
      {
        method,
        headers: { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      },
    );
    return {
      status: response.status,
      data: response.status === 204 ? null : await response.json(),
    };
  }
  try {
    const { data: catalogs } = await request("/catalogs");
    for (const situation of ["Active", "Inactive"]) {
      const result = await request("/users", "POST", {
        name: `Loan Test ${situation}`,
        email: `loan-${situation}-${Date.now()}@example.com`,
        situationId: catalogs.situations.find(
          (s) => s.nameSituation === situation,
        ).id,
      });
      assert.equal(result.status, 201);
      people.push(result.data);
    }
    for (const situation of ["Available", "Out of Stock"]) {
      const result = await request("/products", "POST", {
        name: `Loan test ${situation}`,
        productCategoryId: catalogs.productCategories[0].id,
        productSituationId: catalogs.productSituations.find(
          (s) => s.name === situation,
        ).id,
      });
      assert.equal(result.status, 201);
      products.push(result.data);
    }
    const body = {
      userId: people[0].id,
      productId: products[0].id,
      dueAt: new Date(Date.now() + 86400000).toISOString(),
    };
    assert.equal(
      (
        await request("/loans", "POST", {
          ...body,
          dueAt: new Date(0).toISOString(),
        })
      ).status,
      422,
    );
    assert.equal(
      (await request("/loans", "POST", { ...body, userId: people[1].id }))
        .status,
      409,
    );
    assert.equal(
      (await request("/loans", "POST", { ...body, productId: products[1].id }))
        .status,
      409,
    );
    const simultaneous = await Promise.all([
      request("/loans", "POST", body),
      request("/loans", "POST", body),
    ]);
    assert.deepEqual(simultaneous.map((r) => r.status).sort(), [201, 409]);
    const loan = simultaneous.find((r) => r.status === 201).data;
    loans.push(loan.id);
    assert.equal(
      (await request(`/users/${people[0].id}`, "DELETE")).status,
      422,
    );
    assert.equal(
      (await request(`/products/${products[0].id}`, "DELETE")).status,
      422,
    );
    const page = await request("/loans?limit=100");
    assert.ok(page.data.data.find((l) => l.id === loan.id).product.name);
    assert.equal(
      (await request(`/loans/${loan.id}/return`, "POST")).status,
      200,
    );
    assert.equal(
      (await request(`/loans/${loan.id}/return`, "POST")).status,
      409,
    );
    const next = await request("/loans", "POST", body);
    assert.equal(next.status, 201);
    loans.push(next.data.id);
    assert.equal(
      (await request(`/loans/${next.data.id}/return`, "POST")).status,
      200,
    );
    assert.equal(
      (await request(`/products/${products[0].id}`, "DELETE")).status,
      422,
    );
  } finally {
    if (loans.length) await db.getRepository(Loan).delete(loans);
    for (const p of products) await request(`/products/${p.id}`, "DELETE");
    for (const p of people) await request(`/users/${p.id}`, "DELETE");
    await new Promise((resolve) => server.close(resolve));
    await db.destroy();
  }
});
