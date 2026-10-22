const { test } = require('node:test');
const assert = require('node:assert/strict');
const { AppDataSource: db } = require('../dist/config/database');
const app = require('../dist/app').default;

test('PostgreSQL CRUD, relations, pagination and constraints', async () => {
  if (!process.env.DATABASE_URL || process.env.TEST_DATABASE !== 'true') throw new Error('Set TEST_DATABASE=true and DATABASE_URL to an isolated migrated and seeded test database');
  await db.initialize();
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const created = [];
  async function request(path, method = 'GET', body) {
    const response = await fetch(`http://127.0.0.1:${server.address().port}/api/v1${path}`, { method, headers: { 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, data: response.status === 204 ? null : await response.json() };
  }
  try {
    const catalogs = await request('/catalogs');
    assert.equal(catalogs.status, 200);
    const situationId = catalogs.data.situations[0].id;
    const user = { name: ' Test User ', email: `TEST-${Date.now()}@example.com`, situationId };
    const saved = await request('/users', 'POST', user);
    assert.equal(saved.status, 201); created.push(['/users', saved.data.id]);
    assert.equal(saved.data.name, 'Test User');
    assert.equal(saved.data.email, user.email.toLowerCase());
    assert.equal((await request('/users', 'POST', user)).status, 409);
    assert.equal((await request('/users', 'POST', { ...user, email: 'missing@example.com', situationId: 2147483647 })).status, 422);
    assert.equal((await request(`/users/${saved.data.id}`)).data.situation.id, situationId);
    assert.equal((await request(`/users/${saved.data.id}`, 'PUT', { name: 'Updated User' })).data.name, 'Updated User');
    const product = await request('/products', 'POST', { name: 'Test Product', productCategoryId: catalogs.data.productCategories[0].id, productSituationId: catalogs.data.productSituations[0].id });
    assert.equal(product.status, 201); created.push(['/products', product.data.id]);
    assert.ok((await request(`/products/${product.data.id}`)).data.productCategory.name);
    assert.equal((await request(`/products/${product.data.id}`, 'PUT', { name: 'Updated Product' })).data.name, 'Updated Product');
    const page = await request('/products?page=1&limit=1');
    assert.equal(page.data.limit, 1); assert.equal(page.data.data.length, 1);
    for (const [path, id] of created) {
      assert.equal((await request(`${path}/${id}`, 'DELETE')).status, 204);
      assert.equal((await request(`${path}/${id}`)).status, 404);
      assert.equal((await request(`${path}/${id}`, 'PUT', { name: 'Missing' })).status, 404);
      assert.equal((await request(`${path}/${id}`, 'DELETE')).status, 404);
    }
  } finally {
    for (const [path, id] of created) await request(`${path}/${id}`, 'DELETE');
    await new Promise(resolve => server.close(resolve));
    await db.destroy();
  }
});
