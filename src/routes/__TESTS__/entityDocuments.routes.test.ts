import mongoose from "mongoose";
import request from "supertest";
import entityDocumentController from "../../controllers/entityDocument.controller";
import projectController from "../../controllers/project.controller";
import userController from "../../controllers/user.controller";
import testUtilFirebase from "../../controllers/__TESTS__/testUtilFirebase";
import app, { server } from "../../index";
import { IEntityDocumentConstructor,  DocumentEntity } from "../../models/entityDocument.model";
import { IProject } from "../../models/project.model";
import { IUser } from "../../models/user.model";

describe("Entity Document routes", () => {
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

  it("Should create an entity document", async () => {
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

    let constructor: IEntityDocumentConstructor = {
      title: "entityTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/entitydocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postEntityRes.status).toBe(201);
    const doc = await entityDocumentController.GetById(postEntityRes.body._id);
    expect(doc).not.toBeNull();

    const updatedProject = await projectController.GetById(project._id);
    expect(updatedProject.entityDocuments).toContainEqual(doc._id);
  });

  it("Should fail to create an entity document without a propper projectid", async () => {
    const token = await testUtilFirebase.loginFirebase();
    const res = await request(app)
      .get("/api/account")
      .set({ Authorization: "Bearer " + token })
      .send();

    const user: IUser = (<any>res).body.user;

    let constructor: IEntityDocumentConstructor = {
      title: "entityTitle",
      projectId: mongoose.Types.ObjectId("60527e54cf14623895fa4b6b"),
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/entitydocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);
    expect(postEntityRes.status).toBe(404);

    const doc = await entityDocumentController.GetById(postEntityRes.body._id);
    expect(doc).toBeNull();
  });

  it("Should update entity document by adding an entityRelation ", async () => {
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
    let constructor: IEntityDocumentConstructor = {
      title: "entityTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/entitydocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postEntityRes.status).toBe(201);

    const doc = await entityDocumentController.GetById(postEntityRes.body._id);
    expect(doc).not.toBeNull();

    const entity: DocumentEntity = {
      title: "test",
      created: new Date().getTime(),
      entities: [],
      relations: []
    };
    doc.entities.push(entity);

    const updateEntityRes = await request(app)
      .put("/api/entitydocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token })
      .send(doc);
    expect(updateEntityRes.status).toBe(200);
  });

  it("Should update entity document by adding an entityProperty ", async () => {
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
    let constructor: IEntityDocumentConstructor = {
      title: "entityTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/entitydocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postEntityRes.status).toBe(201);

    const doc = await entityDocumentController.GetById(postEntityRes.body._id);
    expect(doc).not.toBeNull();

    const entity: DocumentEntity = {
      title: "test",
      created: new Date().getTime(),
      entities: [],
      relations: []
    };
    doc.entities.push(entity);

    const updateEntityRes = await request(app)
      .put("/api/entitydocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token })
      .send(doc);
    expect(updateEntityRes.status).toBe(200);
  });

  it("Should delete entity document ", async () => {
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
    let constructor: IEntityDocumentConstructor = {
      title: "entityTitle",
      projectId: project._id,
      ownerId: user._id,
    };

    const postEntityRes = await request(app)
      .post("/api/entitydocuments")
      .set({ Authorization: "Bearer " + token })
      .send(constructor);

    expect(postEntityRes.status).toBe(201);

    const doc = await entityDocumentController.GetById(postEntityRes.body._id);
    expect(doc).not.toBeNull();

    const delEntityRes = await request(app)
      .delete("/api/entitydocuments/" + doc._id)
      .set({ Authorization: "Bearer " + token });

    expect(delEntityRes.status).toBe(200);

    const docAfter = await entityDocumentController.GetById(
      postEntityRes.body._id
    );
    expect(docAfter).toBeNull();
  });
});
