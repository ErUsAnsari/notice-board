import { prisma } from "@/lib/prisma";

export default async function handler(req, res) {
    console.log("cmq0iv24a00010wu8w1ookq2l");
    console.log(req.query);
    const { id } = req.query;

    if (typeof id !== "string") {
        return res.status(400).json({ error: "Invalid ID" });
    }

    if (req.method === "GET") {
        try {
            const notice = await prisma.notice.findUnique({ where: { id } });
            if (!notice) return res.status(404).json({ error: "Notice not found" });
            return res.status(200).json(notice);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to fetch notice" });
        }
    }

    if (req.method === "PUT") {
        const { title, body, category, priority, imageUrl, publishDate } = req.body;

        if (!title?.trim() || !body?.trim() || !category) {
            return res
                .status(400)
                .json({ error: "Title, body and category are required" });
        }

        try {
            const notice = await prisma.notice.update({
                where: { id },
                data: { title, body, category, priority, publishDate: new Date(publishDate), imageUrl },
            });
            return res.status(200).json(notice);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to update notice" });
        }
    }

    if (req.method === "DELETE") {
        try {
            await prisma.notice.delete({ where: { id } });
            return res.status(200).json({ message: "Notice deleted successfully" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to delete notice" });
        }
    }

    res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
    return res.status(405).json({ error: `Method ${req.method} not allowed` });
}
