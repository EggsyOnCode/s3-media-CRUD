import express from "express";
import multer from "multer";

import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.get("/api/posts", async (req, res) => {
  const posts = await prisma.posts.findMany({ orderBy: [{ created: "desc" }] });
  res.send(posts);
});

app.post("/api/posts", async (req, res) => {
  res.status(201).send(post);
});

app.delete("/api/posts/:id", async (req, res) => {
  const id = +req.params.id;
  res.send(post);
});

app.listen(8080, () => console.log("listening on port 8080"));
