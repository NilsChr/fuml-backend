import mongoose from "mongoose";
import request from "supertest";
import projectController from "../../controllers/project.controller";
import sequenceDocumentController from "../../controllers/sequenceDocument.controller";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IProject } from "../../models/project.model";
import {
  ISequenceDocumentPart,
  ISequenceDocumentConstructor,
} from "../../models/sequenceDocument.model";
import { IUser } from "../../models/user.model";

describe("Sequence Document routes", () => {
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
    await userController.Flush();
    await projectController.Flush();
  });

  it("Should create a sequence document", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;

    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send({ title: "test" });

    const project: IProject = (<any>postProjectRes).body;

    let constructor: ISequenceDocumentConstructor = {
      title: "sequenceTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postSequenceRes = await request(app)
      .post("/api/sequencedocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postSequenceRes.status).toBe(201);
    const doc = await sequenceDocumentController.GetById(
      postSequenceRes.body._id
    );
    expect(doc).not.toBeNull();

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.sequenceDocuments).toContainEqual(doc._id);
  });

  it("Should fail to create a sequence document without a propper projectid", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;

    let constructor: ISequenceDocumentConstructor = {
      title: "sequenceTitle",
      projectId: mongoose.Types.ObjectId("60527e54cf14623895fa4b6b"),
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/sequencedocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);
    expect(postEntityRes.status).toBe(404);

    const doc = await sequenceDocumentController.GetById(
      postEntityRes.body._id
    );
    expect(doc).toBeNull();
  });

  it("Should update a sequence document by adding a sequenceParticipant", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;
    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send({ title: "test" });

    const project: IProject = (<any>postProjectRes).body;
    let constructor: ISequenceDocumentConstructor = {
      title: "sequenceTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postRes = await request(app)
      .post("/api/sequencedocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postRes.status).toBe(201);

    const doc = await sequenceDocumentController.GetById(postRes.body._id);
    expect(doc).not.toBeNull();

    const participant = { title: "firebase" };
    doc.participants.push(participant);

    const updateRes = await request(app)
      .put("/api/sequencedocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token })
      .send(doc);
    expect(updateRes.status).toBe(200);
  });

  it("Should update a sequence document by adding an sequencePart ", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;
    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send({ title: "test" });

    const project: IProject = (<any>postProjectRes).body;
    let constructor: ISequenceDocumentConstructor = {
      title: "sequenceTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postRes = await request(app)
      .post("/api/sequencedocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postRes.status).toBe(201);

    const doc = await sequenceDocumentController.GetById(postRes.body._id);
    expect(doc).not.toBeNull();

    const part: ISequenceDocumentPart = {
      title: "2234",
      block: false,
      code: "",
      editorOpen: false,
      visible: false,
    };
    doc.parts.push(part);

    const updateRes = await request(app)
      .put("/api/sequencedocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token })
      .send(doc);
    expect(updateRes.status).toBe(200);
  });

  it("Should delete sequence document ", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;
    const postProjectRes = await request(app)
      .post("/api/projects")
      .set({ Authorization: "Bearer " + token })
      .send({ title: "test" });

    const project: IProject = (<any>postProjectRes).body;
    let constructor: ISequenceDocumentConstructor = {
      title: "sequenceTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postRes = await request(app)
      .post("/api/sequencedocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postRes.status).toBe(201);

    const doc = await sequenceDocumentController.GetById(postRes.body._id);
    expect(doc).not.toBeNull();

    const delRes = await request(app)
      .delete("/api/sequencedocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token });

    expect(delRes.status).toBe(200);

    const docAfter = await sequenceDocumentController.GetById(postRes.body._id);
    expect(docAfter).toBeNull();
  });
});
