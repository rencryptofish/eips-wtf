import { PrismaClient } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from 'next'

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const commits = await prisma.commits.findMany();
    res.status(200).json(commits);
  } else if (req.method === "POST") {
    const { hexsha, committed_datetime, authored_datetime, message, author_email, author_name } = req.body;
    const commit = await prisma.commits.create({
      data: {
        hexsha,
        committed_datetime,
        authored_datetime,
        message,
        author_email,
        author_name,
      },
    });
    res.status(201).json(commit);
  } else {
    res.status(405).json({ message: "Method not allowed" });
  }
}
