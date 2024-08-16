import localforage from "localforage";
import {
  getContainerListFromStorage,
  setContainerListToStorage,
  setContainerNameToStorage,
  setElementsToStorage,
} from "./localStorage";
import { message } from "antd";
import { RESVERED_LOCALSTORAGE_KEYS } from "../app_constants";
import { queryExcalidrawFileData } from "./LocalData";

// 进步本平台创建数据
const STORE_EXAM_STUDENT = localforage.createInstance({
  driver: localforage.INDEXEDDB, // 使用indexDB
  name: "exam-student", // 数据库名称
  version: 2.0, // 版本
});

export const printExamStudentCommandFromLocalForageVal = async () => {
  try {
    const command = (await getExamStudentCommandFromLocalForage()) as string;
    const createFileName =
      (await getExamStudentFileNameFromLocalForage()) as string;
    console.log(`command:${command}`);
    console.log(`createFileName:${createFileName}`);
    message.error(`${command} `);
    message.error(`${createFileName} `);
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const getExamStudentCommandFromLocalForage = async () => {
  try {
    const command = await STORE_EXAM_STUDENT.getItem("examStudentCommand");
    return command;
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

export const getExamStudentOpenFileNameFromLocalForage = async () => {
  try {
    const createFileName = await STORE_EXAM_STUDENT.getItem("openFileName");
    return createFileName;
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

export const removeExamStudentCommand = async () => {
  try {
    await STORE_EXAM_STUDENT.removeItem("examStudentCommand");
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
    console.log(`secondCommand:${command}`);

    if (command == null) {
      console.log("exam_student command not exist");
      removeExamStudentCommand();
      return;
    }
    printExamStudentCommandFromLocalForageVal();

    const containerList: string[] = getContainerListFromStorage();

    if (command === "createNewFile") {
      const createFileName =
        (await getExamStudentFileNameFromLocalForage()) as string;
      if (containerList.includes(createFileName)) {
        message.error(`画布 ${createFileName} 已存在，无需重复创建`);
        removeExamStudentCommand();
        return;
      }

      if (RESVERED_LOCALSTORAGE_KEYS.includes(createFileName)) {
        message.error(`请不要以 excalidraw_ 开头进行画布命名`);
        removeExamStudentCommand();
        return;
      }

      console.log("开始设置文件名和内容");
      setContainerNameToStorage(createFileName);
      setContainerListToStorage([...containerList, createFileName]);
      setElementsToStorage([]);
      removeExamStudentCommand();
      window.location.reload();
      return;
    }
    if (command === "openExcalidrawFile") {
      const openFileName =
        (await getExamStudentOpenFileNameFromLocalForage()) as string;

      console.log("开始设置文件名和内容");
      setContainerNameToStorage(openFileName);
      queryExcalidrawFileData(openFileName);

      if (!containerList.includes(openFileName)) {
        setContainerListToStorage([...containerList, openFileName]);
      }

      setElementsToStorage([]);
      removeExamStudentCommand();
      window.location.reload();
      return;
    }
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};
