import express from "express";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";

///multer config -- storing images temp in memorySTorage for processing etc

const app = express();
app
  .use(bodyParser.urlencoded({ extended: false }))
  .use(cors())
  .use(bodyParser.json());
const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/api/posts", async (req, res) => {
  const posts = await prisma.posts.findMany({ orderBy: [{ created: "desc" }] });
  console.log(req.body);
  res.send(posts);
});

app.post("/api/posts", upload.single("image"), async (req, res) => {
  console.log(req.body);
  console.log(req.file);
});

app.delete("/api/posts/:id", async (req, res) => {
  const id = +req.params.id;
  res.send(post);
});

app.listen(8080, () => console.log("listening on port 8080"));
