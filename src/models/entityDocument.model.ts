import mongoose, { Schema, Document } from "mongoose";

class DocumentEntityProperty {
  title: string;
  type: string;
}

class DocumentEntityRelation {
  title: string;
  type: string;
}

export interface IEntityDocument extends Document {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  entityProperties: DocumentEntityProperty[];
  entityRelations: DocumentEntityRelation[];
}

export interface IEntityDocumentDTO {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
  created: Number;
  type: string;
  entityProperties: DocumentEntityProperty[];
  entityRelations: DocumentEntityRelation[];
}

export interface IEntityDocumentConstructor {
  projectId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  title: string;
}

const DocumentEntityPropertySchema: Schema = new Schema({
  title: { type: String, required: true, unique: false },
  type: { type: String, required: true, unique: false },
});

const DocumentEntityRelationSchema: Schema = new Schema({
  title: { type: String, required: true, unique: false },
  type: { type: String, required: true, unique: false },
});

const EntityDocumentSchema: Schema = new Schema({
  projectId: [{ type: mongoose.Types.ObjectId, ref: "Project" }],
  ownerId: [{ type: mongoose.Types.ObjectId, ref: "User" }],
  title: { type: String, required: true, unique: false },
  created: { type: Number, default: Date.now() },
  type: { type: String, default: "ENTITY" },

  entityProperties: [DocumentEntityPropertySchema],
  entityRelations: [DocumentEntityRelationSchema],
});

export default mongoose.model<IEntityDocument>(
  "EntityDocument",
  EntityDocumentSchema
);
