import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api/client";
import { socket } from "../socket";

const initialState = {
  user: null,
  status: "idle",
  error: null,
  ischecked: false
};

// ================= THUNKS =================

export const login = createAsyncThunk("auth/login", async ({ email, password }, thunkAPI) => {
  try {
    localStorage.clear("guest")
    socket.disconnect();
    const res = await api.post("/login", { email, password });
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "login failed"
    );
  }
});

export const signup = createAsyncThunk("auth/signup", async ({ email, name, password }, thunkAPI) => {
  try {
    const res = await api.post("/signup", { email, name, password });
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "signup failed"
    );
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const res = await api.post("/logout");
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "logout failed"
    );
  }
});

export const fetch = createAsyncThunk("auth/fetchMe", async (_, thunkAPI) => {
  try {
    const res = await api.get("/fetchme");
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "fetch failed"
    );
  }
});

export const refresh = createAsyncThunk("auth/refresh", async (_, thunkAPI) => {
  try {
    const res = await api.post("/refresh");
    return res.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(
      error.response?.data?.message || error.message || "refresh failed"
    );
  }
});

// ================= SLICE =================

const authslice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {

    const pending = (state) => {
      state.status = "pending";
      state.error = null;
    };

    const fulfilled = (state, action) => {
      state.user = action.payload;
      state.status = "success";
      state.error = null;
      state.ischecked = true;
    };

    const rejected = (state, action) => {
      state.user = null;
      state.status = "failed";
      state.error = action.payload;
      state.ischecked = true;
    };

    builder
      // login
      .addCase(login.pending, pending)
      .addCase(login.fulfilled, fulfilled)
      .addCase(login.rejected, rejected)

      // signup
      .addCase(signup.pending, pending)
      .addCase(signup.fulfilled, fulfilled)
      .addCase(signup.rejected, rejected)

      // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = "success";
        state.error = null;
        state.ischecked = true;
      })

      // fetchMe
      .addCase(fetch.pending, pending)
      .addCase(fetch.fulfilled, fulfilled)
      .addCase(fetch.rejected, rejected)

      // refresh
      .addCase(refresh.fulfilled, fulfilled);
  }
});

export const authreducer = authslice.reducer;