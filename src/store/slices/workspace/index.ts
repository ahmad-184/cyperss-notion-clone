import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { getAllWorkspacesThunk } from "./thunk-actions";
import { WorkspaceType } from "@/types";

interface WorkspaceState {
  workspaces: WorkspaceType[];
  active_workspace: WorkspaceType | null;
}

const initialState: WorkspaceState = {
  workspaces: [],
  active_workspace: null,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {
    addWorkspace(state, action: PayloadAction<WorkspaceType | null>) {
      const { payload } = action;
      if (payload) {
        state.workspaces.push({ ...payload });
      }
    },
    setActiveWorkspace(state, action: PayloadAction<WorkspaceType>) {
      const { payload } = action;
      if (payload) {
        state.active_workspace = payload;
      }
    },
  },
  extraReducers(builder) {
    builder.addCase(
      getAllWorkspacesThunk.fulfilled,
      (state, action: PayloadAction<WorkspaceType[] | undefined>) => {
        const { payload } = action;
        if (payload) {
          state.workspaces = payload;
        }
      }
    );
  },
});

export default workspaceSlice.reducer;

export const { addWorkspace, setActiveWorkspace } = workspaceSlice.actions;
