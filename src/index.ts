import express from "express";
import bodyParser from "body-parser";
import router from "./routes/api";
import db from "./utils/database";

async function init() {
  try {
    const result = await db();

    console.log("db status: ", result);

    const app = express();

    app.use(bodyParser.json());

    const PORT = 3000;

    app.get("/", (req, res) => {
      res
        .status(200)
        .json({ message: "Welcome to the MERN Event Backend API", data: null });
    });

    app.use("/api", router);

    app.listen(PORT, () =>
      console.log(`Server is running on http://localhost:${PORT}`)
    );
  } catch (error) {
    console.error("Error initializing the server:", error);
  }
}

init();
