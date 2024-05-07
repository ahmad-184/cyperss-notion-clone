import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { getAllWorkspacesThunk } from "./thunk-actions";
import { ChangeInTrashStatusTypes, FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";

interface WorkspaceState {
  workspaces: WorkspaceTypes[];
  current_workspace: WorkspaceTypes | null;
  loading: boolean;
  background_overlay: boolean;
}

const initialState: WorkspaceState = {
  workspaces: [],
  current_workspace: null,
  loading: false,
  background_overlay: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    changeBgOverlayStatus: (state, action: PayloadAction<boolean>) => {
      state.background_overlay = action.payload;
    },
    addWorkspace: (
      state,
      action: PayloadAction<{
        data: WorkspaceTypes;
      }>
    ) => {
      const { payload } = action;
      if (!payload) return;
      state.workspaces.push(payload.data);
    },
    replaceWorkspace: (state, action: PayloadAction<WorkspaceTypes>) => {
      const { payload } = action;
      if (!payload) return;
      if (payload.id === state.current_workspace?.id) {
        state.current_workspace = payload;
      }
      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === payload.id
      );
      state.workspaces[workspaceIndex] = payload;
    },
    setCurrentWorkspace: (state, action: PayloadAction<WorkspaceTypes>) => {
      const { payload } = action;
      if (!payload) return;
      state.current_workspace = payload;
    },
    addFolder: (state, action: PayloadAction<{ data: FolderType }>) => {
      const { data } = action.payload;
      if (data) {
        if (!state.current_workspace) return;

        const workspaceId = state.current_workspace?.id;
        if (!workspaceId) return;

        state.current_workspace.folders.push(data);

        const index = state.workspaces.findIndex((e) => e.id === workspaceId);

        state.workspaces[index].folders.push(data);
      }
    },
    replaceFolder: (state, action: PayloadAction<FolderType>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = state.current_workspace.folders.findIndex(
        (e) => e.id === data.id
      );

      state.current_workspace.folders[folderIndex] = data;

      const workspaceId = state.current_workspace.id;

      const WorkspaceIndex = state.workspaces.findIndex(
        (e) => e.id === workspaceId
      );
      state.workspaces[WorkspaceIndex] = state.current_workspace;
    },
    replaceFile: (state, action: PayloadAction<File>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = state.current_workspace.folders.findIndex(
        (e) => e.id === data.folderId
      );

      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === state.current_workspace?.id
      );

      const fileIndex = state.current_workspace.folders[
        folderIndex
      ].files.findIndex((e) => e.id === data.id);

      state.current_workspace.folders[folderIndex].files[fileIndex] = data;

      state.workspaces[workspaceIndex] = state.current_workspace;
    },
    addfile: (
      state,
      action: PayloadAction<{ data: File; folderId: string }>
    ) => {
      const { data, folderId } = action.payload;
      if (data) {
        if (!state.current_workspace) return;

        const workspaceId = state.current_workspace?.id;
        if (!workspaceId) return;

        const workspaceIndex = state.workspaces.findIndex(
          (e) => e.id === workspaceId
        );

        const folderIndex = state.current_workspace.folders.findIndex(
          (e) => e.id === folderId
        );

        state.current_workspace.folders[folderIndex].files.push(data);

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
    removeFolder: (
      state,
      action: PayloadAction<{
        id: string;
      }>
    ) => {
      const { id } = action.payload;
      if (!state.current_workspace || !id) return;
      if (!state.current_workspace) return;

      state.current_workspace.folders = state.current_workspace.folders.filter(
        (e) => e.id !== id
      );

      const workspaceId = state.current_workspace.id;

      const index = state.workspaces.findIndex((e) => e.id === workspaceId);
      state.workspaces[index] = state.current_workspace;
    },
    removeFile: (
      state,
      action: PayloadAction<{
        id: string;
        folderId: string;
      }>
    ) => {
      const { folderId, id } = action.payload;
      if (!state.current_workspace) return;
      if (!folderId || !id) return;
      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === state.current_workspace?.id
      );
      const folderIndex = state.current_workspace.folders.findIndex(
        (e) => e.id === folderId
      );

      state.current_workspace.folders[folderIndex].files =
        state.current_workspace.folders[folderIndex].files.filter(
          (e) => e.id !== id
        );
      state.workspaces[workspaceIndex] = state.current_workspace;
    },
    changeInTrashStatus: (
      state,
      action: PayloadAction<ChangeInTrashStatusTypes>
    ) => {
      const { type, id, folderId, inTrashBy, inTrash } = action.payload;

      if (!state.current_workspace) return;

      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === state.current_workspace?.id
      );

      const folId = folderId ? folderId : id;
      const folderIndex = state.current_workspace?.folders.findIndex(
        (e) => e.id === folId
      );

      if (type === "folder") {
        state.current_workspace.folders[folderIndex] = {
          ...state.current_workspace.folders[folderIndex],
          inTrash,
          inTrashBy,
        };
      }

      if (type === "file") {
        const fileIndex = state.current_workspace.folders[
          folderIndex
        ].files.findIndex((e) => e.id === id);

        state.current_workspace.folders[folderIndex].files[fileIndex] = {
          ...state.current_workspace.folders[folderIndex].files[fileIndex],
          inTrash,
          inTrashBy,
        };
      }

      state.workspaces[workspaceIndex] = state.current_workspace;
    },
    changeEmoji: (
      state,
      action: PayloadAction<{
        emoji: string;
        type: "file" | "folder";
        folderId?: string;
        id: string;
      }>
    ) => {
      const { emoji, id, type, folderId } = action.payload;
      if (!state.current_workspace) return;

      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === state.current_workspace?.id
      );

      if (type === "folder") {
        const folderIndex = state.current_workspace?.folders.findIndex(
          (e) => e.id === id
        );
        state.current_workspace.folders[folderIndex].iconId = emoji;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }

      if (type === "file") {
        const folderIndex = state.current_workspace?.folders.findIndex(
          (e) => e.id === folderId
        );
        const fileIndex = state.current_workspace?.folders[
          folderIndex
        ].files.findIndex((e) => e.id === id);

        state.current_workspace.folders[folderIndex].files[fileIndex].iconId =
          emoji;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
    changeFileFolderTitle: (
      state,
      action: PayloadAction<{
        type: "folder" | "file";
        title: string;
        folderId?: string;
        id?: string;
      }>
    ) => {
      const { title, type, id, folderId } = action.payload;

      if (!state.current_workspace) return;

      const workspaceIndex = state.workspaces.findIndex(
        (e) => e.id === state.current_workspace?.id
      );

      if (type === "folder") {
        const folderIndex = state.current_workspace?.folders.findIndex(
          (e) => e.id === id
        );
        state.current_workspace.folders[folderIndex].title = title;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
      if (type === "file") {
        const folderIndex = state.current_workspace?.folders.findIndex(
          (e) => e.id === folderId
        );
        const fileIndex = state.current_workspace?.folders[
          folderIndex
        ].files.findIndex((e) => e.id === id);

        state.current_workspace.folders[folderIndex].files[fileIndex].title =
          title;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getAllWorkspacesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllWorkspacesThunk.fulfilled,
        (state, action: PayloadAction<WorkspaceTypes[] | undefined>) => {
          state.loading = false;
          const { payload } = action;
          if (!payload) return;
          state.workspaces = payload;
        }
      )
      .addCase(getAllWorkspacesThunk.rejected, (state) => {
        state.loading = false;
      });
  },
});

export default workspaceSlice.reducer;

export const {
  addWorkspace,
  replaceWorkspace,
  setCurrentWorkspace,
  replaceFile,
  replaceFolder,
  removeFolder,
  removeFile,
  addFolder,
  addfile,
  changeEmoji,
  changeFileFolderTitle,
  changeInTrashStatus,
  changeBgOverlayStatus,
} = workspaceSlice.actions;
