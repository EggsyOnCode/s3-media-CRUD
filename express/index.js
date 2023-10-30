import express from "express";
import multer from "multer";
import cors from "cors";
import bodyParser from "body-parser";
import crypto from "crypto";
import { PrismaClient } from "@prisma/client";
import dotnev from "dotenv";
dotnev.config();
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

///multer config -- storing images temp in memorySTorage for processing etc

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(express.json());
const prisma = new PrismaClient();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const randomBytes = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");

//FETCHING THE ENV VARS
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_ACCESS_KEY;
const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;

//creating an s3 bucket

const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretKey,
  },
});

app.get("/api/posts", async (req, res) => {
  const posts = await prisma.posts.findMany({ orderBy: [{ created: "desc" }] });
  console.log(posts);
  for (const post of posts) {
    const objParams = {
      Bucket: bucketName,
      Key: post.imageName,
    };
    const command = new GetObjectCommand(objParams);
    const url = await getSignedUrl(s3, command, { expiresIn: 60 * 10 });
    post.imageUrl = url;
  }

  res.send(posts);
});

app.post("/api/posts", upload.single("image"), async (req, res) => {
  // req.file.buffer --> image data
  console.log(req.body);
  console.log(req.file);

  //image resizing
  const resized = await sharp(req.file.buffer)
    .resize({ width: 1080, height: 1920, fit: "contain" })
    .toBuffer();

  //command to be executed by s3 bucket
  const image = randomBytes();
  const params = {
    Bucket: bucketName,
    Key: image,
    Body: resized,
    ContentType: req.file.mimetype,
  };
  const command = new PutObjectCommand(params);

  await s3.send(command);

  const post = await prisma.posts.create({
    data: {
      imageName: image,
      caption: req.body.caption,
    },
  });

  res.send(post);
});

app.delete("/api/posts/:id", async (req, res) => {
  const id = +req.params.id;
  const post = await prisma.posts.findUnique({ where: { id } });

  if (!post) {
    res.status(404).send("post not found!");
    return;
  }
  const params = {
    Bucket: bucketName,
    Key: post.imageName,
  };

  const command = new DeleteObjectCommand(params);
  await s3.send(command);

  await prisma.posts.delete({ where: { id } });

  res.status(200).send(post);
});

app.listen(8080, () => console.log("listening on port 8080"));
