import mongoose from "mongoose";

import { DATABASE_URL } from "./env";

const connect = async () => {
  try {
    await mongoose.connect(DATABASE_URL, {
      dbName: "mern-event",
    });

    return Promise.resolve("Database connected successfully");
  } catch (error) {
    return Promise.reject("Database connection failed: " + error);
  }
};

export default connect;
