export const CATEGORIES = ["Exam", "Event", "General"];
export const PRIORITIES = ["Normal", "Urgent"];

export function validateNotice({ title, body, category, priority, publishDate }) {
    const errors = {};

    if (!title || typeof title !== "string" || title.trim() === "") {
        errors.title = "Title is required.";
    } else if (title.trim().length > 150) {
        errors.title = "Title must be 150 characters or fewer.";
    }

    if (!body || typeof body !== "string" || body.trim() === "") {
        errors.body = "Body is required.";
    }

    if (!category || !CATEGORIES.includes(category)) {
        errors.category = `Category must be one of: ${CATEGORIES.join(", ")}.`;
    }

    if (!priority || !PRIORITIES.includes(priority)) {
        errors.priority = `Priority must be one of: ${PRIORITIES.join(", ")}.`;
    }

    if (!publishDate) {
        errors.publishDate = "Publish date is required.";
    } else {
        const d = new Date(publishDate);
        if (isNaN(d.getTime())) {
            errors.publishDate = "Publish date must be a valid date.";
        }
    }

    return errors;
}
