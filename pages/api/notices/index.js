import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const notices = await prisma.notice.findMany({
                orderBy: [
                    {
                        priority: "desc",
                    },
                    {
                        publishDate: "desc"
                    }
                ],
            });
            return res.status(200).json(notices);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch notices" });
        }
    }

    if (req.method === "POST") {
        const { title, body, category, priority, publishDate, imageUrl } = req.body;

        if (!title?.trim() || !body?.trim() || !category) {
            return res
                .status(400)
                .json({ error: "Title, body and category are required" });
        }

        if (!publishDate || isNaN(new Date(publishDate).getTime())) {
            return res.status(400).json({
                error: "Valid publish date is required"
            });
        }

        console.log(req.body);
        console.log("publishDate:", publishDate);

        try {
            const notice = await prisma.notice.create({
                data: { title, body, category, priority, publishDate: new Date(publishDate), imageUrl },
            });
            return res.status(201).json(notice);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to create notice" });
        }
    }

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
