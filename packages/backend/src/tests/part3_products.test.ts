declare module "*.sql?raw" {
  const content: string;
  export default content;
}

import { beforeAll, describe, expect, it } from "vitest";
import { env } from "cloudflare:test";
import { buildApp } from "../app";
import { getControlDb, migrateDatabase } from "../lib/db";

import controlSchema from "../lib/control_schema.sql?raw";

describe("Part 3: Products Routes", () => {
  const app = buildApp();
  const controlDb = getControlDb(env);

  let token = "";
  let tenantId = "";
  let productId = "";

  beforeAll(async () => {
    // Run migrations on control registry
    await migrateDatabase(controlDb, controlSchema);

    // Sign up a merchant to obtain auth token
    const signupPayload = {
      email: "merchant@mystore.com",
      password: "securepassword123",
      storeName: "Product Test Store",
      subdomain: "mystore-prod",
    };

    const signupRes = await app.request(
      "/auth/merchant/signup",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signupPayload),
      },
      env
    );

    const body = (await signupRes.json()) as any;
    token = body.accessToken;
    tenantId = body.tenantId;
  });

  it("should create a product and enforce SKU uniqueness", async () => {
    const productPayload = {
      name: "T-Shirt Premium",
      description: "Organic cotton t-shirt",
      price: 29.99,
      stockQuantity: 100,
      status: "active",
      sku: "TSHIRT-001",
      category: "Clothing",
      variants: [],
      images: ["https://example.com/image1.png"],
    };

    // 1. Create Product
    const createRes = await app.request(
      "/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(productPayload),
      },
      env
    );

    if (createRes.status !== 201) {
      console.log("Create Product Failed Body:", await createRes.text());
    }

    expect(createRes.status).toBe(201);
    const body = (await createRes.json()) as any;
    expect(body.productId).toBeDefined();
    productId = body.productId;
    expect(body.sku).toBe("TSHIRT-001");

    // 2. Create another product with the same SKU (should fail)
    const duplicateRes = await app.request(
      "/products",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...productPayload,
          name: "Different T-Shirt",
        }),
      },
      env
    );

    expect(duplicateRes.status).toBe(400);
    const dupBody = (await duplicateRes.json()) as any;
    expect(dupBody.error).toContain("already in use by another product");
  });

  it("should fetch products as a merchant", async () => {
    const listRes = await app.request(
      "/products",
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
      env
    );

    expect(listRes.status).toBe(200);
    const products = (await listRes.json()) as any[];
    expect(products.length).toBe(1);
    expect(products[0].productId).toBe(productId);

    // Fetch individual product details
    const getRes = await app.request(
      `/products/${productId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
      env
    );

    expect(getRes.status).toBe(200);
    const product = (await getRes.json()) as any;
    expect(product.productId).toBe(productId);
  });

  it("should fetch products from the storefront (Future-Cacheable Read Path)", async () => {
    // Public catalog listing
    const listRes = await app.request(
      "/store/mystore-prod/products",
      {
        method: "GET",
      },
      env
    );

    expect(listRes.status).toBe(200);
    const products = (await listRes.json()) as any[];
    expect(products.length).toBe(1);
    expect(products[0].productId).toBe(productId);

    // Public catalog product detail
    const getRes = await app.request(
      `/store/mystore-prod/products/${productId}`,
      {
        method: "GET",
      },
      env
    );

    expect(getRes.status).toBe(200);
    const product = (await getRes.json()) as any;
    expect(product.productId).toBe(productId);
  });

  it("should update a product", async () => {
    const updatePayload = {
      name: "T-Shirt Premium Extended",
      price: 34.99,
      stockQuantity: 90,
      status: "active",
      sku: "TSHIRT-001",
      category: "Clothing",
      variants: [],
      images: ["https://example.com/image1.png", "https://example.com/image2.png"],
    };

    const updateRes = await app.request(
      `/products/${productId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(updatePayload),
      },
      env
    );

    expect(updateRes.status).toBe(200);

    // Fetch and check updated details
    const getRes = await app.request(
      `/products/${productId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
      env
    );

    const product = (await getRes.json()) as any;
    expect(product.name).toBe("T-Shirt Premium Extended");
    expect(product.price).toBe(34.99);
  });

  it("should delete a product", async () => {
    const deleteRes = await app.request(
      `/products/${productId}`,
      {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
      env
    );

    expect(deleteRes.status).toBe(200);

    // Verify it is gone
    const getRes = await app.request(
      `/products/${productId}`,
      {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      },
      env
    );

    expect(getRes.status).toBe(404);
  });
});
