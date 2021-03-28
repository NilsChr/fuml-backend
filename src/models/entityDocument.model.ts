import mongoose, { Schema, Document } from "mongoose";

export class DocumentEntity {
  title: string;
  created: number;
  entities: DocumentEntityProperty[];
  relations: DocumentEntityRelation[];
}

class DocumentEntityProperty {
  title: string;
  type: string;
}

class DocumentEntityRelation {
  entity: string;
  type: string;
}

export interface IEntityDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  entities: DocumentEntity[];
}

export interface IEntityDocumentDTO {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  entities: DocumentEntity[];
}

export interface IEntityDocumentConstructor {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
}

const DocumentEntitySchema: Schema = new Schema({
  title: { type: String, required: true, unique: false },
  type: { type: String, required: true, unique: false },
  properties: [
    {
      type: { type: String, required: true, unique: false },
      title: { type: String, required: true, unique: false },
    },
  ],
  relations: [
    {
      type: { type: String, required: true, unique: false },
      entity: { type: String, required: true, unique: false },
    },
  ],
});

const EntityDocumentSchema: Schema = new Schema({
  projectId: { type: mongoose.Types.ObjectId, ref: "Project" },
  ownerId: { type: mongoose.Types.ObjectId, ref: "User" },
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  type: { type: String, default: "ENTITY" },
  entities: [DocumentEntitySchema],
});

export default mongoose.model<IEntityDocument>(
  "EntityDocument",
  EntityDocumentSchema
);
