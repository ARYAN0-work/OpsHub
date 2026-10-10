import { beforeAll, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../app";

const createEmail = () => `channel-${Date.now()}-${Math.random()}@example.com`;

const password = "password123";

type AuthUser = {
  id: number;
  email: string;
  token: string;
};

const createUser = async (): Promise<AuthUser> => {
  const email = createEmail();

  const registerResponse = await request(app)
    .post("/auth/register")
    .send({ email, password });

  expect(registerResponse.status).toBe(201);

  const loginResponse = await request(app)
    .post("/auth/login")
    .send({ email, password });

  expect(loginResponse.status).toBe(200);

  return {
    id: loginResponse.body.user.id,
    email,
    token: loginResponse.body.accessToken,
  };
};

describe("Channel creation", () => {
  let owner: AuthUser;
  let member: AuthUser;
  let workspaceId: number;

  beforeAll(async () => {
    owner = await createUser();
    member = await createUser();

    const workspaceResponse = await request(app)
      .post("/workspaces")
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "Channel Test Workspace",
        slug: `channel-test-${Date.now()}`,
      });

    expect(workspaceResponse.status).toBe(201);
    workspaceId = workspaceResponse.body.workspace.id;

    const memberResponse = await request(app)
      .post(`/workspaces/${workspaceId}/members`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        userId: member.id,
        role: "MEMBER",
      });

    expect(memberResponse.status).toBe(201);
  });

  it("rejects channel creation without authentication", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/channels`)
      .send({ name: "backend" });

    expect(response.status).toBe(401);
  });

  it("rejects invalid channel data", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/channels`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "" });

    expect(response.status).toBe(400);
  });

  it("allows the OWNER to create a channel", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/channels`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({
        name: "backend",
        description: "Backend engineering discussions",
      });

    expect(response.status).toBe(201);
    expect(response.body.channel).toMatchObject({
      name: "backend",
      description: "Backend engineering discussions",
      workspaceId,
    });
  });

  it("prevents a MEMBER from creating a channel", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/channels`)
      .set("Authorization", `Bearer ${member.token}`)
      .send({ name: "restricted" });

    expect(response.status).toBe(403);
  });

  it("rejects duplicate channel names within a workspace", async () => {
    const response = await request(app)
      .post(`/workspaces/${workspaceId}/channels`)
      .set("Authorization", `Bearer ${owner.token}`)
      .send({ name: "backend" });

    expect(response.status).toBe(409);
  });
});
