import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const { sessions } = await req.json();

    // 保存每个会话
    await Promise.all(
      sessions.map(async (session: any) => {
        await prisma.chat.upsert({
          where: {
            id: session.id,
          },
          create: {
            id: session.id,
            userId,
            title: session.title,
            messages: {
              create: session.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
              })),
            },
          },
          update: {
            title: session.title,
            messages: {
              deleteMany: {},
              create: session.messages.map((msg: any) => ({
                role: msg.role,
                content: msg.content,
              })),
            },
          },
        });
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: true, msg: "Failed to sync data" },
      { status: 500 },
    );
  }
}

// Get all chats for current user
export async function GET(req: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return new Response("Unauthorized", { status: 401 });
  }

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
      { error: true, msg: "Failed to fetch chats" },
      { status: 500 },
    );
  }
}

export const runtime = "edge";
