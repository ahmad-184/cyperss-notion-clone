import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { getAllWorkspacesThunk } from "./thunk-actions";
import { WorkspaceTypes } from "@/types";
import { getWorkspacesReturnType } from "@/server-actions";

interface WorkspaceState {
  workspaces: NonNullable<getWorkspacesReturnType["data"]>;
  current_workspace: WorkspaceTypes | null;
  loading: boolean;
}

const initialState: WorkspaceState = {
  workspaces: {
    private: [],
    shared: [],
    collaborating: [],
  },
  current_workspace: null,
  loading: false,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    addWorkspace(
      state,
      action: PayloadAction<{
        data: WorkspaceTypes;
        type: "private" | "shared" | "collaborating";
      }>
    ) {
      const { payload } = action;
      if (!payload) return;
      switch (payload.type) {
        case "private":
          state.workspaces.private.push(payload.data);
          break;
        case "shared":
          state.workspaces.shared.push(payload.data);
          break;
        case "collaborating":
          state.workspaces.collaborating.push(payload.data);
          break;
        default:
          break;
      }
    },
    setCurrentWorkspace(state, action: PayloadAction<WorkspaceTypes>) {
      const { payload } = action;
      if (!payload) return;
      state.current_workspace = payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getAllWorkspacesThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        getAllWorkspacesThunk.fulfilled,
        (state, action: PayloadAction<getWorkspacesReturnType["data"]>) => {
          state.loading = false;
          const { payload } = action;
          if (!payload) return;
          state.workspaces = payload;
        }
      )
      .addCase(getAllWorkspacesThunk.rejected, (state, action) => {
        state.loading = false;
      });
  },
});

export default workspaceSlice.reducer;

export const { addWorkspace, setCurrentWorkspace } = workspaceSlice.actions;
