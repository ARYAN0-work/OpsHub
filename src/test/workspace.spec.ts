import request from "supertest";
import { beforeAll, describe, expect, it } from "vitest";
import app from "../app.js";

const createEmail = () =>
  `workspace-${Date.now()}-${Math.random()}@example.com`;

const password = "password123";

type AuthUser = {
  id: number;
  email: string;
  token: string;
};

const createUser = async (): Promise<AuthUser> => {
  const email = createEmail();

  const registerResponse = await request(app).post("/auth/register").send({
    email,
    password,
  });

  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app).post("/auth/login").send({
    email,
    password,
  });

  expect(loginResponse.status).toBe(200);

  return {
    id: loginResponse.body.user.id,
    email,
    token: loginResponse.body.accessToken,
  };
};

describe("Workspace API", () => {
  let owner: AuthUser;
  let anotherUser: AuthUser;
  let workspaceId: number;

  beforeAll(async () => {
    owner = await createUser();
    anotherUser = await createUser();
  });

  it("rejects workspace creation without authentication", async () => {
    const response = await request(app)
      .post("/workspaces")
      .send({
        name: "Unauthorized Workspace",
        slug: `unauthorized-${Date.now()}`,
      });

    expect(response.status).toBe(401);
  });

  it("rejects invalid workspace data", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "",
        slug: "INVALID SLUG",
      });

    expect(response.status).toBe(400);
  });

  it("allows an authenticated user to create a workspace", async () => {
    const response = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Test Workspace",
        slug: `test-workspace-${Date.now()}`,
      });

    expect(response.status).toBe(201);
    expect(response.body.workspace).toMatchObject({
      name: "Test Workspace",
    });

    workspaceId = response.body.workspace.id;
  });

  it("allows the owner to access their workspace", async () => {
    const response = await request(app)
      .get(`/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(response.body.workspace.id).toBe(workspaceId);
    expect(response.body.role).toBe("OWNER");
  });

  it("prevents a non-member from accessing the workspace", async () => {
    const response = await request(app)
      .get(`/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${anotherUser.token}`);

    expect(response.status).toBe(403);
  });

  it("lists only the authenticated user's workspaces", async () => {
    const response = await request(app)
      .get("/workspaces")
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);

    expect(
      response.body.workspaces.some(
        (item: { workspaceId: number }) => item.workspaceId === workspaceId,
      ),
    ).toBe(true);
  });

  it("allows the OWNER to add a member", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        userId: anotherUser.id,
        role: "ADMIN",
      });

    expect(response.status).toBe(201);
    expect(response.body.membership).toMatchObject({
      userId: anotherUser.id,
      workspaceId,
      role: "ADMIN",
    });
  });

  it("rejects adding the same member twice", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        userId: anotherUser.id,
        role: "ADMIN",
      });

    expect(response.status).toBe(409);
  });

  it("allows the OWNER to list workspace members", async () => {
    const response = await request(app)
      .get(`/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.members)).toBe(true);

    expect(
      response.body.members.some(
        (membership: { userId: number }) =>
          membership.userId === anotherUser.id,
      ),
    ).toBe(true);
  });

  it("allows the OWNER to change a member's role", async () => {
    const response = await request(app)
      .patch(`/workspaces/${workspaceId}/members/${anotherUser.id}`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        role: "MEMBER",
      });

    expect(response.status).toBe(200);
  });

  it("prevents a MEMBER from changing roles", async () => {
    const response = await request(app)
      .patch(`/workspaces/${workspaceId}/members/${owner.id}`)
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        role: "MEMBER",
      });

    expect(response.status).toBe(403);
  });

  it("prevents a MEMBER from updating the workspace", async () => {
    const response = await request(app)
      .patch(`/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${anotherUser.token}`)
      .send({
        name: "Unauthorized Update",
      });

    expect(response.status).toBe(403);
  });

  it("prevents a MEMBER from removing another member", async () => {
    const response = await request(app)
      .delete(`/workspaces/${workspaceId}/members/${owner.id}`)
      .set("Authorization", `Bearer ${anotherUser.token}`);

    expect(response.status).toBe(403);
  });

  it("prevents the OWNER from leaving the workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${workspaceId}/leave`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(response.status).toBe(403);
  });

  it("allows a MEMBER to leave the workspace", async () => {
    const response = await request(app)
      .delete(`/workspaces/${workspaceId}/leave`)
      .set("Authorization", `Bearer ${anotherUser.token}`);

    expect(response.status).toBe(204);
  });

  it("prevents a non-member from accessing the workspace after leaving", async () => {
    const response = await request(app)
      .get(`/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${anotherUser.token}`);

    expect(response.status).toBe(403);
  });

  it("allows only the OWNER to delete a workspace", async () => {
    const createResponse = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Deletion Test Workspace",
        slug: `deletion-test-${Date.now()}`,
      });

    expect(createResponse.status).toBe(201);

    const deletionWorkspaceId = createResponse.body.workspace.id;

    const addResponse = await request(app)
      .post(`/workspaces/${deletionWorkspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        userId: anotherUser.id,
        role: "ADMIN",
      });

    expect(addResponse.status).toBe(201);

    const adminDeleteResponse = await request(app)
      .delete(`/workspaces/${deletionWorkspaceId}`)
      .set("Authorization", `Bearer ${anotherUser.token}`);

    expect(adminDeleteResponse.status).toBe(403);

    const ownerDeleteResponse = await request(app)
      .delete(`/workspaces/${deletionWorkspaceId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(ownerDeleteResponse.status).toBe(204);

    const accessResponse = await request(app)
      .get(`/workspaces/${deletionWorkspaceId}`)
      .set("Authorization", `Bearer ${owner.token}`);

    expect(accessResponse.status).toBe(403);
  });
});
