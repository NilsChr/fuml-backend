import mongoose from "mongoose";
import { IUserDTO, IUserUpdatesDTO } from "../../models/user.model";
import userController from "../user.controller";
import testUtil from "./testUtil";


describe("User Controller", () => {
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
  });

  beforeEach(async () => {
    await userController.Flush();
  });

  it("Should create a user", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();
  })

  it("Should flush the db", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    const users = await userController.Get();
    expect(users.length).toBe(1);

    await userController.Flush();

    const usersAfterFlush = await userController.Get();
    expect(usersAfterFlush.length).toBe(0);
  })

  it("Should get user by googleId", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    const other = await userController.GetByGoogleId(user.googleId);
    expect(user._id).toEqual(other._id);
  })

  it("Should get user by id", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    const other = await userController.GetById(user._id);
    expect(user._id).toEqual(other._id);
  })

  it("Should get user by email", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    const other = await userController.GetByEmail(user.email);
    expect(user._id).toEqual(other._id);
  })

  it("Should update user nickname", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    const newNick = 'newNick;'
    const newMail = 'newMail;'
    const newAvatarUrl = 'newAvatarUrl;'

    let updates:IUserUpdatesDTO = {
        avatarUrl:newAvatarUrl,
        email: newMail,
        nickName: newNick,
        projects: [],
        selectedTheme: 1
    }
    const updated = await userController.Update(user, updates);

    expect(updated.nickName).toBe(newNick);
    expect(updated.email).toBe(newMail);
    expect(updated.avatarUrl).toBe(newAvatarUrl);
  })

  it("Should fail to update user isAdmin", async () => {
    const user = await testUtil.generateRandomUser();
    expect(user).not.toBeNull();

    let updates:any = {
        isAdmin: true
    }
    const updated = await userController.Update(user, updates);

    expect(updated.isAdmin).toBe(false);
  })

  it("Should get random user", async () => {
    const user = await testUtil.generateRandomUser();
    const user2 = await testUtil.generateRandomUser();

    const randomUser = await userController.GetRandom(5);
    expect(randomUser).not.toBe(null);
  })

  it("Should delete a user", async () => {
    const user = await testUtil.generateRandomUser();
    const user2 = await testUtil.generateRandomUser();

    const allUsers = await userController.Get();
    expect(allUsers.length).toBe(2);

    await userController.Delete(user._id);

    const allUsersAfter = await userController.Get();
    expect(allUsersAfter.length).toBe(1);
  })
});
