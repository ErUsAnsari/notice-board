import { prisma } from "@/lib/prisma";
import { validateNotice } from "@/lib/validate";

export default async function handler(req, res) {
    if (req.method === "GET") {
        try {
            const notices = await prisma.notice.findMany({
                orderBy: [
                    { priority: "desc" },    // Urgent before Normal
                    { publishDate: "desc" }  // newest first within each priority
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

        const errors = validateNotice({ title, body, category, priority, publishDate });
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        try {
            const notice = await prisma.notice.create({
                data: { title: title.trim(), body: body.trim(), category, priority, publishDate: new Date(publishDate), imageUrl: imageUrl?.trim() || null },
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
