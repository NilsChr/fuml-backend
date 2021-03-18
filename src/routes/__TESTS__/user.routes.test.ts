import mongoose from "mongoose";
import request from "supertest";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IUser } from "../../models/user.model";

describe("User routes", () => {
  beforeAll(async () => {
    const m = await mongoose.connect(global.__MONGO_URI__, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  });

  afterAll(async () => {
    mongoose.connection.close();
    server.close();
  });

  beforeEach(async () => {
    await testUtilFirebase.signOut();
  });

  it("Should connect to app and create a user", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");

    const user: IUser = (<any>res).body;

    expect(user).not.toBeNull();

    const userFromDb = userController.GetById(user._id);
    expect(userFromDb).not.toBeNull();
  });

  it("Should get user by id", async () => {
    //jest.setTimeout(20000);
    const token = await testUtilFirebase.loginFirebase();

    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");
    const user: IUser = (<any>res).body;

    expect(user).not.toBeNull();

    const res2 = await request(app)
      .get("/api/users/" + user._id)
      .set({ Authorization: "Bearer " + token });
    expect(res2.status).toEqual(200);
    expect(res2.body._id).toBe(user._id);
  });

  it("Should try get another user by id", async () => {
    const token1 = await testUtilFirebase.loginFirebase2();
    const res1 = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token1 })
      .send();
    await testUtilFirebase.signOut();
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();
    expect(res.status).toEqual(200);
    expect(res.body).toHaveProperty("_id");

    const user: IUser = (<any>res).body;

    expect(user).not.toBeNull();

    const res2 = await request(app)
      .get("/api/users/" + res1.body._id)
      .set({ Authorization: "Bearer " + token });
    expect(res2.status).toEqual(403);
    expect(res2.body._id).toBe(undefined);
  });

  it("Should update user nickname", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body;

    user.nickName = "master";
    const res2 = await request(app)
      .put("/api/users/" + user._id)
      .set({ Authorization: "Bearer " + token })
      .send(user);

    expect(res2.status).toBe(200);

    const updatedUser = await userController.GetById(user._id);
    expect(updatedUser.nickName).toBe("master");
  });

  it("Should delete a user", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body;

    const token2 = await testUtilFirebase.loginFirebase2();
    const res2 = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token2 })
      .send();
    const user2: IUser = (<any>res2).body;

    user2.nickName = "master";
    const res3 = await request(app)
      .put("/api/users/" + user2._id)
      .set({ Authorization: "Bearer " + token })
      .send(user2);

    expect(res3.status).toBe(403);

    const updatedUser = await userController.GetById(user2._id);
    expect(updatedUser.nickName).toBe("");
  });

  it("Should try to update other users nickname", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body;

    const res2 = await request(app)
    .delete("/api/users/" + user._id)
    .set({ Authorization: "Bearer " + token })
    .send();

    expect(res2.status).toBe(200);

    const userAfterDelete = await userController.GetById(user._id);
    expect(userAfterDelete).toBeNull();
  });
});
