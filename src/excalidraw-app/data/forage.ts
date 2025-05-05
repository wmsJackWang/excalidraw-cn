import localforage from "localforage";
import {
  getContainerListFromStorage,
  getContainerNameFromStorage,
  getContainerNameParentIdFromStorage,
  setContainerListToStorage,
  setContainerNameToStorage,
  setContainerNameParentIdToStorage,
  setElementsToStorage,
} from "./localStorage";
import { message } from "antd";
import { RESVERED_LOCALSTORAGE_KEYS } from "../app_constants";
import { queryExcalidrawFileData } from "./LocalData";
import { ExcalidrawElement } from "../../element/types";

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

export const getExamStudentOpenFileNameParentIdFromLocalForage = async () => {
  try {
    const parentId = await STORE_EXAM_STUDENT.getItem("parentId");
    return parentId;
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

export type ExcalidrawFileData = {
  elements: readonly ExcalidrawElement[];
  command: string;
};

export const executeExamStudentCommand = async () => {
  try {
    const command = (await getExamStudentCommandFromLocalForage()) as string;
    console.log(`secondCommand:${command}`);

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

      console.log("创建新文件");
      setContainerNameToStorage(createFileName);
      setContainerListToStorage([...containerList, createFileName]);
      setElementsToStorage([]);
      removeExamStudentCommand();
      const elements: readonly ExcalidrawElement[] = [];
      const resp: ExcalidrawFileData = { elements, command };
      return resp;
    }
    if (command === "openExcalidrawFile") {
      const openFileName =
        (await getExamStudentOpenFileNameFromLocalForage()) as string;
      const openFileNameParentId =
        (await getExamStudentOpenFileNameParentIdFromLocalForage()) as string;

      console.log(`打开文件:${openFileName}`);
      message.success(`open file:${openFileName}`);
      setContainerNameToStorage(openFileName);
      setContainerNameParentIdToStorage(openFileNameParentId);
      const queryResult = (await queryExcalidrawFileData(
        openFileName,
        openFileNameParentId,
      )) as Object;
      console.log(`queryResult:${JSON.stringify(queryResult)}`);
      const resJson = JSON.parse(JSON.stringify(queryResult));
      const response = resJson.response;
      const fileData = response.fileData;
      const fileDataJson = JSON.parse(fileData);
      const praseElements = JSON.parse(
        fileDataJson.elementsJson,
      ) as ExcalidrawElement[];

      if (!containerList.includes(openFileName)) {
        setContainerListToStorage([...containerList, openFileName]);
      }
      const elements: ExcalidrawElement[] = praseElements;
      setElementsToStorage(elements);
      removeExamStudentCommand();
      // window.location.reload();
      const resp: ExcalidrawFileData = { elements, command };
      return resp;
    }

    const containerName = getContainerNameFromStorage();
    const parentId = getContainerNameParentIdFromStorage();
    const queryResult = (await queryExcalidrawFileData(
      containerName,
      parentId,
    )) as Object;
    console.log(`queryResult:${JSON.stringify(queryResult)}`);
    const resJson = JSON.parse(JSON.stringify(queryResult));
    const response = resJson.response;
    const fileData = response.fileData;
    const fileDataJson = JSON.parse(fileData);
    const praseElements = JSON.parse(
      fileDataJson.elementsJson,
    ) as ExcalidrawElement[];

    if (!containerList.includes(containerName)) {
      setContainerListToStorage([...containerList, containerName]);
    }
    const elements: ExcalidrawElement[] = praseElements;
    setElementsToStorage(elements);

    const resp: ExcalidrawFileData = { elements, command };
    return resp;
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);

    const elements: readonly ExcalidrawElement[] = [];
    const command = "";
    const resp: ExcalidrawFileData = { elements, command };
    return resp;
  }
};
