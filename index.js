const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;

const fs = require("fs");
const path = require("path");
const pathToFile = path.resolve("./data.json");

// // cors
// const cors = require("cors");
// const corsOptions = {
//     origin: "http://localhost:3000",
//     optionsSuccessStatus: 200
// }
// app.use(cors(corsOptions));

// パスの確認
// console.log(pathToFile);

// post で受け取った値が　undefined になるのを回避する
app.use(express.json());

const getResource = () => JSON.parse(fs.readFileSync(pathToFile));

app.get("/api/resources/:id", (req, res) => {
  const resources = getResource();
  // 同じ const resourceId = req.params.id;
  const { id } = req.params;
  const resource = resources.find((resource) => resource.id === id);
  res.send(resource);
});

app.patch("/api/resources/:id", (req, res) => {
  const resources = getResource();
  const { id } = req.params;
  const index = resources.findIndex((resource) => resource.id === id);
  const activeResource = resources.find(
    (resource) => resources.status === "active"
  );

  if (resources[index].status === "complete") {
    return res
      .status(422)
      .send("Cannot update because resource has been completed!");
  }

  resources[index] = req.body;

  // active resource related functionality
  if (req.body.status === "active") {
    if (activeResource) {
      return res.status(422).send("There is active resource already!");
    }

    resources[index].status = "active";
    resources[index].activationTime = new Date();
  }

  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been updated!");
  });
});

app.get("/api/activeresource", (req, res) => {
  const resources = getResource();
  const activeResource = resources.find(
    (resource) => resource.status === "active"
  );
  res.send(activeResource);
});

app.get("/api/resources", (req, res) => {
  const resources = getResource();
  res.send(resources);
});

app.post("/api/resources", (req, res) => {
  const resources = getResource();
  // form以外の項目を作成
  const resource = req.body;
  resource.createdAt = new Date();
  resource.status = "inactive";
  // Date.now() を使用して一意にする
  resource.id = Date.now().toString();
  // 項目を追加 push:最後尾  unshift:先頭
  // slice で先頭から取得しているので unshift
  // resources.push(resource);
  resources.unshift(resource);
  // jsonファイルへ書き込み  path,data
  // サーバーエラーの場合　文法間違い　項目が正しくない
  fs.writeFile(pathToFile, JSON.stringify(resources, null, 2), (error) => {
    if (error) {
      return res.status(422).send("Cannot store data in the file!");
    }

    return res.send("Data has been saved!");
  });
});

app.listen(PORT, () => {
  console.log("Server is listening on port:" + PORT);
});
