import axios from "axios";

export async function getFiles({
    currentPage,
    page,
}: {
    page: string;
    currentPage: number;
}) {
    if (page === "subscription") {
        return { files: [] };
    }

    try {
        const res = await axios.get(`/api/v1/files/${page}`, {
            params: {
                page: currentPage,
            },
        });
        return res.status === 200 ? res.data.data : { files: [], total: 0, currentPage: 1, totalPages: 0 };
    } catch (error) {
        console.error("Error fetching files:", error);
        return { files: [], total: 0, currentPage: 1, totalPages: 0 };
    }
}

export const searchFiles = async (search: string) => {
    if (!search) return [];

    try {
        const res = await axios.get("/api/v1/files", {
            params: {
                search,
            },
        });
        return res.data.data;
    } catch (error) {
        console.error("Error searching files:", error);
        return [];
    }
};
