import { INestApplication } from "@nestjs/common";
import { DataSource } from "typeorm";
import * as request from "supertest";
import { createTestApp, clearDatabase, promoteToAdmin } from "./utils/test-app";
import { MuscleGroup } from "../src/exercises/entities/exercise.entity";

describe("Exercises (e2e)", () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    ({ app, dataSource } = await createTestApp());
  });

  afterEach(async () => {
    await clearDatabase(dataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  async function registerUser(email: string) {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password: "password123" });
    return res.body.access_token as string;
  }

  async function registerAdmin(email: string) {
    const res = await request(app.getHttpServer())
      .post("/auth/register")
      .send({ email, password: "password123" });
    const decoded = JSON.parse(
      Buffer.from(res.body.access_token.split(".")[1], "base64").toString(),
    );
    await promoteToAdmin(dataSource, decoded.sub);

    const loginRes = await request(app.getHttpServer())
      .post("/auth/login")
      .send({ email, password: "password123" });
    return loginRes.body.access_token as string;
  }

  it("rejects unauthenticated requests with 401", async () => {
    await request(app.getHttpServer()).get("/exercises").expect(401);
  });

  describe("GET /exercises", () => {
    it("returns exercises to an authenticated user", async () => {
      const adminToken = await registerAdmin("admin@example.com");
      await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "bench_press", muscle_group: MuscleGroup.CHEST });

      const userToken = await registerUser("user@example.com");
      const res = await request(app.getHttpServer())
        .get("/exercises")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(200);

      expect(res.body).toHaveLength(1);
      expect(res.body[0].slug).toBe("bench_press");
    });
  });

  describe("POST /exercises", () => {
    it("forbids a non-admin user with 403", async () => {
      const userToken = await registerUser("user@example.com");

      await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ slug: "squat", muscle_group: MuscleGroup.LEGS })
        .expect(403);
    });

    it("allows an admin to create a global exercise", async () => {
      const adminToken = await registerAdmin("admin@example.com");

      const res = await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "squat", muscle_group: MuscleGroup.LEGS })
        .expect(201);

      expect(res.body).toMatchObject({
        slug: "squat",
        muscle_group: MuscleGroup.LEGS,
        is_global: true,
      });
    });

    it("rejects an invalid payload with 400", async () => {
      const adminToken = await registerAdmin("admin@example.com");

      await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "squat", muscle_group: "not_a_muscle_group" })
        .expect(400);
    });
  });

  describe("GET /exercises/:id", () => {
    it("returns 404 for an unknown id", async () => {
      const userToken = await registerUser("user@example.com");

      await request(app.getHttpServer())
        .get("/exercises/00000000-0000-0000-0000-000000000000")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(404);
    });

    it("returns 400 for a malformed id", async () => {
      const userToken = await registerUser("user@example.com");

      await request(app.getHttpServer())
        .get("/exercises/not-a-uuid")
        .set("Authorization", `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe("PUT /exercises/:id", () => {
    it("forbids a non-admin user with 403", async () => {
      const adminToken = await registerAdmin("admin@example.com");
      const created = await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "deadlift", muscle_group: MuscleGroup.BACK });

      const userToken = await registerUser("user@example.com");
      await request(app.getHttpServer())
        .put(`/exercises/${created.body.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .send({ notes: "hacked" })
        .expect(403);
    });

    it("allows an admin to update an exercise", async () => {
      const adminToken = await registerAdmin("admin@example.com");
      const created = await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "deadlift", muscle_group: MuscleGroup.BACK });

      const res = await request(app.getHttpServer())
        .put(`/exercises/${created.body.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ notes: "keep back straight" })
        .expect(200);

      expect(res.body.notes).toBe("keep back straight");
    });
  });

  describe("DELETE /exercises/:id", () => {
    it("forbids a non-admin user with 403", async () => {
      const adminToken = await registerAdmin("admin@example.com");
      const created = await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "lunge", muscle_group: MuscleGroup.LEGS });

      const userToken = await registerUser("user@example.com");
      await request(app.getHttpServer())
        .delete(`/exercises/${created.body.id}`)
        .set("Authorization", `Bearer ${userToken}`)
        .expect(403);
    });

    it("allows an admin to delete an exercise", async () => {
      const adminToken = await registerAdmin("admin@example.com");
      const created = await request(app.getHttpServer())
        .post("/exercises")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ slug: "lunge", muscle_group: MuscleGroup.LEGS });

      await request(app.getHttpServer())
        .delete(`/exercises/${created.body.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(`/exercises/${created.body.id}`)
        .set("Authorization", `Bearer ${adminToken}`)
        .expect(404);
    });
  });
});
