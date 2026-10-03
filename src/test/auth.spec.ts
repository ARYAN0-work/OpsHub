import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../app.js";

const createEmail = () => {
  return `test-${Date.now()}-${Math.random()}@example.com`;
};

describe("Authentication", () => {
  it("should register a new user", async () => {
    const email = createEmail();

    const response = await request(app).post("/auth/register").send({
      email,
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.user).toMatchObject({
      email,
    });
    expect(response.body.user).not.toHaveProperty("password");
  });

  it("should reject an invalid email", async () => {
    const response = await request(app).post("/auth/register").send({
      email: "invalid-email",
      password: "password123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request");
  });

  it("should reject a short password", async () => {
    const response = await request(app).post("/auth/register").send({
      email: createEmail(),
      password: "123",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid request");
  });

  it("should reject duplicate registration", async () => {
    const email = createEmail();

    await request(app).post("/auth/register").send({
      email,
      password: "password123",
    });

    const response = await request(app).post("/auth/register").send({
      email,
      password: "password123",
    });

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("User already exists");
  });

  it("should login with valid credentials", async () => {
    const email = createEmail();
    const password = "password123";

    await request(app).post("/auth/register").send({
      email,
      password,
    });

    const response = await request(app).post("/auth/login").send({
      email,
      password,
    });

    expect(response.status).toBe(200);
    expect(response.body.user).toMatchObject({
      email,
    });
    expect(response.body.accessToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe("string");
  });

  it("should reject an incorrect password", async () => {
    const email = createEmail();

    await request(app).post("/auth/register").send({
      email,
      password: "password123",
    });

    const response = await request(app).post("/auth/login").send({
      email,
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  it("should reject a nonexistent user", async () => {
    const response = await request(app).post("/auth/login").send({
      email: createEmail(),
      password: "password123",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });
});
