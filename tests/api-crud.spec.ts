import { test, expect } from '@playwright/test';

const BASE_URL = 'https://api.restful-api.dev';
const RESOURCE = '/objects';

test.use({
  baseURL: BASE_URL,
  extraHTTPHeaders: {
    'Content-Type': 'application/json',
  },
});

type CreatedObject = {
  id: string;
  name: string;
  data: {
    year: number;
    price: number;
    'CPU model': string;
    'Hard disk size': string;
  };
};

test('resource CRUD', async ({ request }) => {
  let objectId: string;
  let objectName = `Kon's super deluxe phone version ${Math.floor(Math.random() * 100)}`;
  let objectPrice = Math.floor(Math.random() * 1000);

  await test.step('Create', async () => {
    const response = await request.post(RESOURCE, {
      data: {
        name: objectName,
        data: {
          year: 2026,
          price: objectPrice,
          'CPU model': 'QA Silicon',
          'Hard disk size': '512 GB',
        },
      },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as CreatedObject;
    expect(body.id).toBeTruthy();
    expect(body.name).toBe(objectName);
    expect(body.data.price).toBe(objectPrice);

    objectId = body.id;
  });

  await test.step('Read', async () => {
    const response = await request.get(`${RESOURCE}/${objectId}`);

    expect(response.status()).toBe(200);

    const body = (await response.json()) as CreatedObject;
    expect(body.id).toBe(objectId);
    expect(body.name).toBe(objectName);
  });

  await test.step('Update', async () => {
    objectPrice = objectPrice * 5.5;
    objectName = objectName + ' - Now with 10% more power!';

    const response = await request.put(`${RESOURCE}/${objectId}`, {
      data: {
        name: objectName,
        data: {
          year: 2026,
          price: objectPrice,
          'CPU model': 'QA Silicon',
          'Hard disk size': '512 GB',
        },
      },
    });

    expect(response.status()).toBe(200);

    const body = (await response.json()) as CreatedObject;
    expect(body.name).toBe(objectName);
    expect(body.data.price).toBe(objectPrice);
  });

  await test.step('Delete', async () => {
    const response = await request.delete(`${RESOURCE}/${objectId}`);

    expect(response.status()).toBe(200);

    const body = (await response.json()) as { message: string };
    expect(body.message).toContain(objectId);
  });

  await test.step('Get after delete', async () => {
    const response = await request.get(`${RESOURCE}/${objectId}`);

    expect(response.status()).toBe(404);

    const body = (await response.json()) as { error: string };
    expect(body.error).toContain('Object with id');
  });
});

