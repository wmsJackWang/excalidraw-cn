// time constants (ms)
export const SAVE_TO_LOCAL_STORAGE_TIMEOUT = 300;
export const INITIAL_SCENE_UPDATE_TIMEOUT = 5000;
export const FILE_UPLOAD_TIMEOUT = 300;
export const LOAD_IMAGES_TIMEOUT = 500;
export const SYNC_FULL_SCENE_INTERVAL_MS = 20000;
export const SYNC_BROWSER_TABS_TIMEOUT = 50;
export const CURSOR_SYNC_TIMEOUT = 33; // ~30fps
export const DELETED_ELEMENT_TIMEOUT = 24 * 60 * 60 * 1000; // 1 day

export const FILE_UPLOAD_MAX_BYTES = 3 * 1024 * 1024; // 3 MiB
// 1 year (https://stackoverflow.com/a/25201898/927631)
export const FILE_CACHE_MAX_AGE_SEC = 31536000;

export const WS_EVENTS = {
  SERVER_VOLATILE: "server-volatile-broadcast",
  SERVER: "server-broadcast",
};

export enum WS_SCENE_EVENT_TYPES {
  INIT = "SCENE_INIT",
  UPDATE = "SCENE_UPDATE",
}

export const FIREBASE_STORAGE_PREFIXES = {
  shareLinkFiles: `/files/shareLinks`,
  collabFiles: `/files/rooms`,
};

export const ROOM_ID_BYTES = 10;

export const STORAGE_KEYS = {
  // LOCAL_STORAGE_ELEMENTS: "excalidraw",
  LOCAL_STORAGE_CONTAINER_LIST: "excalidraw_container_list",
  LOCAL_STORAGE_DEFAULT_CONTAINER_NAME: "default_canvas",
  LOCAL_STORAGE_DEFAULT_CONTAINER_NAME_PARENT_ID: "5",
  LOCAL_STORAGE_CONTAINER_ID: "excalidraw_container_id",
  LOCAL_STORAGE_CONTAINER_NAME: "excalidraw_container_name",
  LOCAL_STORAGE_CONTAINER_NAME_PARENT_ID: "excalidraw_container_name_parent_id",
  LOCAL_STORAGE_APP_STATE: "excalidraw-state",
  LOCAL_STORAGE_COLLAB: "excalidraw-collab",
  LOCAL_STORAGE_LIBRARY: "excalidraw-library",
  LOCAL_STORAGE_THEME: "excalidraw-theme",
  VERSION_DATA_STATE: "version-dataState",
  VERSION_FILES: "version-files",
} as const;

export const COOKIES = {
  AUTH_STATE_COOKIE: "excplus-auth",
} as const;

export const isExcalidrawPlusSignedUser = document.cookie.includes(
  COOKIES.AUTH_STATE_COOKIE,
);

export const RESVERED_LOCALSTORAGE_KEYS = [
  "excalidraw_container_list",
  "excalidraw_container_id",
  "excalidraw-state",
  "excalidraw-collab",
  "excalidraw-library",
  "excalidraw-theme",
  "version-dataState",
  "version-files",
];
