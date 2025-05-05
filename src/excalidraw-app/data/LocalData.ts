/**
 * This file deals with saving data state (appState, elements, images, ...)
 * locally to the browser.
 *
 * Notes:
 *
 * - DataState refers to full state of the app: appState, elements, images,
 *   though some state is saved separately (collab username, library) for one
 *   reason or another. We also save different data to different sotrage
 *   (localStorage, indexedDB).
 */

import { createStore, entries, del, getMany, set, setMany } from "idb-keyval";
import { clearAppStateForLocalStorage } from "../../appState";
import { clearElementsForLocalStorage } from "../../element";
import { ExcalidrawElement, FileId } from "../../element/types";
import { AppState, BinaryFileData, BinaryFiles } from "../../types";
import { debounce } from "../../utils";
import { SAVE_TO_LOCAL_STORAGE_TIMEOUT, STORAGE_KEYS } from "../app_constants";
import { FileManager } from "./FileManager";
import { Locker } from "./Locker";
import { updateBrowserStateVersion } from "./tabSync";
import {
  getContainerNameFromStorage,
  getContainerNameParentIdFromStorage,
} from "./localStorage";
import html2canvas from "html2canvas";

const filesStore = createStore("files-db", "files-store");

const STORE_OPEN = process.env.REACT_APP_REMOTE_STORE_OPEN;

// const SERVER_URL = "localhost:8083"
const SERVER_URL = "bittechblog.com/study";

class LocalFileManager extends FileManager {
  clearObsoleteFiles = async (opts: { currentFileIds: FileId[] }) => {
    await entries(filesStore).then((entries) => {
      for (const [id, imageData] of entries as [FileId, BinaryFileData][]) {
        // if image is unused (not on canvas) & is older than 1 day, delete it
        // from storage. We check `lastRetrieved` we care about the last time
        // the image was used (loaded on canvas), not when it was initially
        // created.
        if (
          (!imageData.lastRetrieved ||
            Date.now() - imageData.lastRetrieved > 24 * 3600 * 1000) &&
          !opts.currentFileIds.includes(id as FileId)
        ) {
          del(id, filesStore);
        }
      }
    });
  };
}

export const queryExcalidrawFileData = async (
  containerName: string,
  parentId: string,
) => {
  const elementsJson = "";
  const appStateJson = "";
  const imgData = "";
  try {
    return await postData(
      `http://${SERVER_URL}/api/student/excalidraw/file/query`,
      {
        containerName,
        elementsJson,
        appStateJson,
        imgData,
        parentId,
      },
    );
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};

const saveDataStateToLocalStorageV2 = (
  elements: readonly ExcalidrawElement[],
  appState: AppState,
  imgData: string,
  parentId: string,
) => {
  try {
    const containerName = getContainerNameFromStorage();
    const elementsJson = JSON.stringify(clearElementsForLocalStorage(elements));
    const appStateJson = JSON.stringify(clearAppStateForLocalStorage(appState));

    console.log(`elementsJson:${elementsJson}`);
    console.log(`appStateJson:${appStateJson}`);
    console.log(`imgData, saveToDb:${imgData}`);
    localStorage.setItem(
      // STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
      containerName,
      elementsJson,
    );

    localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE, appStateJson);
    updateBrowserStateVersion(STORAGE_KEYS.VERSION_DATA_STATE);
    console.log(`STORE_OPEN:${STORE_OPEN}`);

    if (STORE_OPEN) {
      const res = postData(
        `http://${SERVER_URL}/api/student/excalidraw/file/addOrUpdate`,
        {
          containerName,
          elementsJson,
          appStateJson,
          imgData,
          parentId,
        },
      );

      console.log(`saveDataStateToLocalStorage, res:${JSON.stringify(res)}`);
    }
  } catch (error: any) {
    // Unable to access window.localStorage
    console.error(error);
  }
};
//
// const saveDataStateToLocalStorage = async (
//   elements: readonly ExcalidrawElement[],
//   appState: AppState,
//   imgData: string,
// ) => {
//   try {
//     const containerName = getContainerNameFromStorage();
//     const parentId = getContainerNameParentIdFromStorage();
//     const elementsJson = JSON.stringify(clearElementsForLocalStorage(elements));
//     const appStateJson = JSON.stringify(clearAppStateForLocalStorage(appState));
//
//     console.log(`elementsJson:${elementsJson}`);
//     console.log(`appStateJson:${appStateJson}`);
//     //     console.log(`imgData, saveToDb:` + imgData);
//     console.log(`parentId:${parentId}`);
//     localStorage.setItem(
//       // STORAGE_KEYS.LOCAL_STORAGE_ELEMENTS,
//       containerName,
//       elementsJson,
//     );
//
//     localStorage.setItem(STORAGE_KEYS.LOCAL_STORAGE_APP_STATE, appStateJson);
//     updateBrowserStateVersion(STORAGE_KEYS.VERSION_DATA_STATE);
//     console.log(`STORE_OPEN:${STORE_OPEN}`);
//
//     if (STORE_OPEN) {
//       const res = await postData(
//         `http://${SERVER_URL}/api/student/excalidraw/file/addOrUpdate`,
//         {
//           containerName,
//           elementsJson,
//           appStateJson,
//           imgData,
//           parentId,
//         },
//       );
//
//       console.log(`saveDataStateToLocalStorage, res:${JSON.stringify(res)}`);
//     }
//   } catch (error: any) {
//     // Unable to access window.localStorage
//     console.error(error);
//   }
// };

type SavingLockTypes = "collaboration";

export class LocalData {
  private static _save = debounce(
    async (
      elements: readonly ExcalidrawElement[],
      appState: AppState,
      files: BinaryFiles,
      onFilesSaved: () => void,
    ) => {
      // const data: ExcalidrawFileData | undefined =
      //   await executeExamStudentCommand();
      // let examElements: readonly ExcalidrawElement[] =
      //   data?.elements as Readonly<ExcalidrawElement[]>;
      // const command = data?.command as string;
      // if (examElements === null) {
      //   examElements = [];
      // }
      // if (command === "createNewFile" || command === "openExcalidrawFile") {
      //   elements = examElements;
      // }

      // console.log("after executeExamStudentCommand");
      // console.log(
      //   `after executeExamStudentCommand， elements:${JSON.stringify(
      //     elements,
      //   )}`,
      // );

      let imgData = "" as string;
      //canvas截图
      const canvasElement = document.getElementsByClassName(
        "excalidraw__canvas",
      )[0] as HTMLElement;
      const parentId = getContainerNameParentIdFromStorage();
      html2canvas(canvasElement, {}).then((canvas) => {
        // canvas.toDataURL() 可以获取图片的 base64 编码
        const dataUrl = canvas.toDataURL();
        // 你可以将 dataUrl 设置为一个 img 标签的 src 属性，或者下载图片等
        console.log(`img base64:${dataUrl}`);
        //const img = document.querySelector("#imgs")
        //img.src = dataUrl
        imgData = dataUrl;

        saveDataStateToLocalStorageV2(elements, appState, imgData, parentId);
        console.log(`LocalData_save[elements]:${JSON.stringify(elements)}`);
        console.log(`LocalData_save[appState]:${JSON.stringify(appState)}`);
        //             console.log(`imgData, saveToDbOut:` + imgData);
        console.log(`parentId:${parentId}`);
      });
      await this.fileStorage.saveFiles({
        elements,
        files,
      });
      onFilesSaved();
    },
    SAVE_TO_LOCAL_STORAGE_TIMEOUT,
  );

  /** Saves DataState, including files. Bails if saving is paused */
  static save = (
    elements: readonly ExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
    onFilesSaved: () => void,
  ) => {
    // we need to make the `isSavePaused` check synchronously (undebounced)
    if (!this.isSavePaused()) {
      this._save(elements, appState, files, onFilesSaved);
    }
  };

  static flushSave = () => {
    this._save.flush();
  };

  private static locker = new Locker<SavingLockTypes>();

  static pauseSave = (lockType: SavingLockTypes) => {
    this.locker.lock(lockType);
  };

  static resumeSave = (lockType: SavingLockTypes) => {
    this.locker.unlock(lockType);
  };

  static isSavePaused = () => {
    return document.hidden || this.locker.isLocked();
  };

  // ---------------------------------------------------------------------------

  static fileStorage = new LocalFileManager({
    getFiles(ids) {
      return getMany(ids, filesStore).then(
        async (filesData: (BinaryFileData | undefined)[]) => {
          const loadedFiles: BinaryFileData[] = [];
          const erroredFiles = new Map<FileId, true>();

          const filesToSave: [FileId, BinaryFileData][] = [];

          filesData.forEach((data, index) => {
            const id = ids[index];
            if (data) {
              const _data: BinaryFileData = {
                ...data,
                lastRetrieved: Date.now(),
              };
              filesToSave.push([id, _data]);
              loadedFiles.push(_data);
            } else {
              erroredFiles.set(id, true);
            }
          });

          try {
            // save loaded files back to storage with updated `lastRetrieved`
            setMany(filesToSave, filesStore);
          } catch (error) {
            console.warn(error);
          }

          return { loadedFiles, erroredFiles };
        },
      );
    },
    async saveFiles({ addedFiles }) {
      const savedFiles = new Map<FileId, true>();
      const erroredFiles = new Map<FileId, true>();

      // before we use `storage` event synchronization, let's update the flag
      // optimistically. Hopefully nothing fails, and an IDB read executed
      // before an IDB write finishes will read the latest value.
      updateBrowserStateVersion(STORAGE_KEYS.VERSION_FILES);

      await Promise.all(
        [...addedFiles].map(async ([id, fileData]) => {
          try {
            await set(id, fileData, filesStore);
            savedFiles.set(id, true);
          } catch (error: any) {
            console.error(error);
            erroredFiles.set(id, true);
          }
        }),
      );

      return { savedFiles, erroredFiles };
    },
  });
}

type Data = {
  containerName: string;
  elementsJson: string;
  appStateJson: string;
  imgData: string;
  parentId: string;
};

const postData = (url = "", data: Data) => {
  // 将数据转换为JSON字符串
  const postData = JSON.stringify(data);

  // 设置头部信息，指示正在发送JSON数据
  const headers = new Headers({
    "Content-Type": "application/json",
    // 'Access-Control-Allow-Origin': '*',
    // 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
    // 'Access-Control-Allow-Headers': 'X-Requested-With,content-type'
  });

  // 发送POST请求
  return fetch(url, {
    method: "POST",
    headers,
    body: postData,
  })
    .then((response) => {
      if (response.ok) {
        return response.json(); // 如果返回数据不是JSON，可以省略这一步
      }
      throw new Error("Network response was not ok.");
    })
    .catch((error) =>
      console.error(
        "There has been a problem with your fetch operation:",
        error,
      ),
    );
};
