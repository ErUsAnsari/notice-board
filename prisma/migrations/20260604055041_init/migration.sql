-- CreateEnum
CREATE TYPE "Category" AS ENUM ('Exam', 'Event', 'General');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('Normal', 'Urgent');

-- CreateTable
CREATE TABLE "Notice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "publishDate" TIMESTAMP(3) NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Notice_pkey" PRIMARY KEY ("id")
);
