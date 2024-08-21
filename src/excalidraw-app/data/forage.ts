import localforage from "localforage";
import {
  getContainerListFromStorage,
  setContainerListToStorage,
  setContainerNameToStorage,
  setElementsToStorage,
} from "./localStorage";
import { message } from "antd";
import { RESVERED_LOCALSTORAGE_KEYS } from "../app_constants";

// 进步本平台创建数据
const STORE_EXAM_STUDENT = localforage.createInstance({
  driver: localforage.INDEXEDDB, // 使用indexDB
  name: "exam-student", // 数据库名称
  version: 2.0, // 版本
});

export const getExamStudentCommandFromLocalForage = async () => {
  try {
    const command = await STORE_EXAM_STUDENT.getItem("examStudentCommand");
    return command;
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const getExamStudentFileNameFromLocalForage = async () => {
  try {
    const createFileName = await STORE_EXAM_STUDENT.getItem("createFileName");
    return createFileName;
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const saveToLocalForageStore = async (key: string, val: string) => {
  await STORE_EXAM_STUDENT.setItem(key, val);
};

export const executeExamStudentCommand = async () => {
  try {
    const command = (await getExamStudentCommandFromLocalForage()) as string;
    const createFileName =
      (await getExamStudentFileNameFromLocalForage()) as string;

    if (command == null) {
      console.log("exam_student command not exist");
      return;
    }

    const containerList: string[] = getContainerListFromStorage();

    if (containerList.includes(createFileName)) {
      message.error(`画布 ${createFileName} 已存在，无需重复创建`);
      return;
    }

    if (RESVERED_LOCALSTORAGE_KEYS.includes(createFileName)) {
      message.error(`请不要以 excalidraw_ 开头进行画布命名`);
      return;
    }

    setContainerNameToStorage(createFileName);
    setContainerListToStorage([...containerList, createFileName]);
    setElementsToStorage([]);

    window.location.reload();
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};
