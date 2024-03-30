import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "@/store";

interface WorkspaceState {
  poop: number;
}

const initialState: WorkspaceState = {
  poop: 0,
};

const workspaceSlice = createSlice({
  name: "workspace",
  initialState,
  reducers: {},
});

export default workspaceSlice.reducer;
