-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "imageName" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalLikes" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);
