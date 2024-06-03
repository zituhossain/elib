import app from "./src/app";

const startServer = async () => {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server started on port ${port}`);
  });
};

startServer();
