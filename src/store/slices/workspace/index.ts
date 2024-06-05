import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { getAllWorkspacesThunk } from "./thunk-actions";
import { ChangeInTrashStatusTypes, FolderType, WorkspaceTypes } from "@/types";
import { File } from "@prisma/client";
import {
  findFile,
  findFileIndex,
  findFolder,
  findFolderIndex,
  findWorkspace,
  findWorkspaceIndex,
} from "@/lib/utils";

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
      const workspaceIndex = findWorkspaceIndex(state.workspaces, payload.id);

      state.workspaces[workspaceIndex] = payload;
    },
    updateWorkspace: (state, action: PayloadAction<WorkspaceTypes>) => {
      const { payload } = action;
      if (!payload) return;
      const workspaceIndex = findWorkspaceIndex(state.workspaces, payload.id);

      if (payload.id === state.current_workspace?.id) {
        state.current_workspace = {
          ...state.current_workspace,
          ...payload,
        };
      }

      state.workspaces[workspaceIndex] = {
        ...findWorkspace(state.workspaces, payload.id),
        ...payload,
      };
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

        const index = findWorkspaceIndex(state.workspaces, workspaceId);

        state.workspaces[index].folders.push(data);
      }
    },
    replaceFolder: (state, action: PayloadAction<FolderType>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = findFolderIndex(state.current_workspace, data.id);

      state.current_workspace.folders[folderIndex] = data;

      const workspaceId = state.current_workspace.id;

      const WorkspaceIndex = findWorkspaceIndex(state.workspaces, workspaceId);

      state.workspaces[WorkspaceIndex] = state.current_workspace;
    },
    updateFolder: (state, action: PayloadAction<FolderType>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = findFolderIndex(state.current_workspace, data.id);

      state.current_workspace.folders[folderIndex] = {
        ...state.current_workspace.folders[folderIndex],
        ...data,
      };

      const workspaceId = state.current_workspace.id;
      const WorkspaceIndex = findWorkspaceIndex(state.workspaces, workspaceId);

      state.workspaces[WorkspaceIndex] = state.current_workspace;
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

        const workspaceIndex = findWorkspaceIndex(
          state.workspaces,
          workspaceId
        );

        const folderIndex = findFolderIndex(state.current_workspace, folderId);

        state.current_workspace.folders[folderIndex].files.push(data);

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
    replaceFile: (state, action: PayloadAction<File>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = findFolderIndex(
        state.current_workspace,
        data.folderId
      );

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      const fileIndex = findFileIndex(
        state.current_workspace,
        data.id,
        data.folderId
      );

      state.current_workspace.folders[folderIndex].files[fileIndex] = data;

      state.workspaces[workspaceIndex] = state.current_workspace;
    },
    updateFile: (state, action: PayloadAction<File>) => {
      const data = action.payload;
      if (!state.current_workspace || !data.id) return;
      if (!state.current_workspace) return;

      const folderIndex = findFolderIndex(
        state.current_workspace,
        data.folderId
      );

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      const fileIndex = findFileIndex(
        state.current_workspace,
        data.id,
        data.folderId
      );

      state.current_workspace.folders[folderIndex].files[fileIndex] = {
        ...findFile(state.current_workspace, data.id, data.folderId),
        ...data,
      };

      state.workspaces[workspaceIndex] = state.current_workspace;
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

      const index = findWorkspaceIndex(state.workspaces, workspaceId);

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
      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );
      const folderIndex = findFolderIndex(state.current_workspace, folderId);

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

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      const folId = folderId ? folderId : id;
      const folderIndex = findFolderIndex(state.current_workspace, folId);

      if (type === "folder") {
        state.current_workspace.folders[folderIndex] = {
          ...findFolder(state.current_workspace, folId),
          inTrash,
          inTrashBy,
        };
      }

      if (type === "file") {
        const fileIndex = findFileIndex(
          state.current_workspace,
          id,
          folderId as string
        );

        state.current_workspace.folders[folderIndex].files[fileIndex] = {
          ...findFile(state.current_workspace, id, folderId as string),
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
        type: "file" | "folder" | "workspace";
        folderId?: string;
        id: string;
      }>
    ) => {
      const { emoji, id, type, folderId } = action.payload;
      if (!state.current_workspace) return;

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      if (type === "workspace") {
        state.current_workspace.iconId = emoji;
        state.workspaces[workspaceIndex] = state.current_workspace;
      }

      if (type === "folder") {
        const folderIndex = findFolderIndex(state.current_workspace, id);
        state.current_workspace.folders[folderIndex].iconId = emoji;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }

      if (type === "file") {
        const folderIndex = findFolderIndex(
          state.current_workspace,
          folderId as string
        );

        const fileIndex = findFileIndex(
          state.current_workspace,
          id,
          folderId as string
        );

        state.current_workspace.folders[folderIndex].files[fileIndex].iconId =
          emoji;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
    changeItemTitle: (
      state,
      action: PayloadAction<{
        type: "folder" | "file" | "workspace";
        title: string;
        folderId?: string;
        id?: string;
      }>
    ) => {
      const { title, type, id, folderId } = action.payload;

      if (!state.current_workspace) return;

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      if (type === "workspace") {
        state.current_workspace.title = title;
        state.workspaces[workspaceIndex] = state.current_workspace;
      }
      if (type === "folder") {
        const folderIndex = findFolderIndex(
          state.current_workspace,
          id as string
        );
        state.current_workspace.folders[folderIndex].title = title;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
      if (type === "file") {
        const folderIndex = findFolderIndex(
          state.current_workspace,
          folderId as string
        );
        const fileIndex = findFileIndex(
          state.current_workspace,
          id as string,
          folderId as string
        );

        state.current_workspace.folders[folderIndex].files[fileIndex].title =
          title;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
    },
    changeBanner: (
      state,
      action: PayloadAction<{
        id: string;
        type: "folder" | "file" | "workspace";
        bannerUrl: string;
        banner_public_id: string;
        folderId?: string;
      }>
    ) => {
      const { id, type, bannerUrl, folderId, banner_public_id } =
        action.payload;
      if (!state.current_workspace) return;

      const workspaceIndex = findWorkspaceIndex(
        state.workspaces,
        state.current_workspace.id
      );

      if (type === "workspace") {
        state.current_workspace.bannerUrl = bannerUrl;
        state.current_workspace.banner_public_id = banner_public_id;
        state.workspaces[workspaceIndex] = state.current_workspace;
      }
      if (type === "folder") {
        const folderIndex = findFolderIndex(
          state.current_workspace,
          id as string
        );
        state.current_workspace.folders[folderIndex].bannerUrl = bannerUrl;
        state.current_workspace.folders[folderIndex].banner_public_id =
          banner_public_id;

        state.workspaces[workspaceIndex] = state.current_workspace;
      }
      if (type === "file") {
        const folderIndex = findFolderIndex(
          state.current_workspace,
          folderId as string
        );
        const fileIndex = findFileIndex(
          state.current_workspace,
          id as string,
          folderId as string
        );

        state.current_workspace.folders[folderIndex].files[
          fileIndex
        ].bannerUrl = bannerUrl;
        state.current_workspace.folders[folderIndex].files[
          fileIndex
        ].banner_public_id = banner_public_id;

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
  updateWorkspace,
  setCurrentWorkspace,
  replaceFile,
  updateFile,
  updateFolder,
  replaceFolder,
  removeFolder,
  removeFile,
  addFolder,
  addfile,
  changeEmoji,
  changeItemTitle,
  changeInTrashStatus,
  changeBgOverlayStatus,
  changeBanner,
} = workspaceSlice.actions;
