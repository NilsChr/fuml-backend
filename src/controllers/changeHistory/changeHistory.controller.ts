import mongoose from "mongoose";
import ChangeHistory, {
  IChangeHistoryDTO,
  IChangeHistory,
} from "../../models/history/history.model";

function Create(changeHistory: IChangeHistoryDTO): Promise<IChangeHistory> {
  changeHistory.created = new Date().toLocaleTimeString();

  return ChangeHistory.create(changeHistory)
    .then((data: IChangeHistory) => {
      return data;
    })
    .catch((error: Error) => {
      throw error;
    });
}

function Flush(): Promise<number> {
  return new Promise(async (resolve) => {
    const result = await ChangeHistory.deleteMany({});
    return resolve(result.deletedCount);
  });
}

function Get(): Promise<IChangeHistory[]> {
  return new Promise(async (resolve) => {
    const history = await ChangeHistory.find();
    return resolve(history);
  });
}

function GetByProjectId(
  projectId: mongoose.Types.ObjectId
): Promise<IChangeHistory[]> {
  return new Promise(async (resolve, reject) => {
    try {
      const query = { projectId: projectId };
      let history = await ChangeHistory.find(query);
      resolve(history);
    } catch (e) {
      reject(e);
    }
  });
}

function Delete(id: mongoose.Types.ObjectId): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      let deleted = await ChangeHistory.findByIdAndDelete(id);
      resolve(deleted != null);
    } catch (e) {
      reject(e);
    }
  });
}

export default {
  Create,
  Flush,
  Get,
  GetByProjectId,
  Delete,
};
