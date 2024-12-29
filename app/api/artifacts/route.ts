import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function handle(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 仅处理 GET 请求获取聊天记录
  if (req.method === "GET") {
    try {
      const chats = await prisma.chat.findMany({
        where: { userId },
        include: {
          messages: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
      return NextResponse.json({ chats });
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { error: true, msg: "Database error" },
        { status: 500 },
      );
    }
  }

  return NextResponse.json(
    { error: true, msg: "Invalid request" },
    { status: 400 },
  );
}

export const GET = handle;

export const runtime = "edge";
