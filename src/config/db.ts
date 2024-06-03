import mongoose from "mongoose";
import { config } from "./config";

const connectDb = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to database");
    });

    mongoose.connection.on("error", (err) => {
      console.error("Failed to connect to database", err);
    });

    await mongoose.connect(config.databaseUrl as string);
  } catch (error) {
    console.error("Failed to connect to database", error);
    process.exit(1);
  }
};

export default connectDb;
