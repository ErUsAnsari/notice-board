import { prisma } from "@/lib/prisma";
import { validateNotice } from "@/lib/validate";

export default async function handler(req, res) {
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

        const errors = validateNotice({ title, body, category, priority, publishDate });
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ errors });
        }

        try {

            // Checking whether the record actually exists before trying to update
            const existing = await prisma.notice.findUnique({ where: { id } });
            if (!existing) return res.status(404).json({ error: "Notice not found." });

            const notice = await prisma.notice.update({
                where: { id },
                data: { title: title.trim(), body: body.trim(), category, priority, publishDate: new Date(publishDate), imageUrl: imageUrl?.trim() || null },
            });
            return res.status(200).json(notice);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Failed to update notice" });
        }
    }

    if (req.method === "DELETE") {
        try {

            const existing = await prisma.notice.findUnique({ where: { id } });
            if (!existing) return res.status(404).json({ error: "Notice not found." });

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
