import { getWorkspacesAction } from "@/server-actions";
import { createAsyncThunk } from "@reduxjs/toolkit";

export const getAllWorkspacesThunk = createAsyncThunk(
  "workspace/getAllWorkspacesThunk",
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await getWorkspacesAction();
      if (error && error.message) throw new Error(error.message);
      if (data) return data;
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);
