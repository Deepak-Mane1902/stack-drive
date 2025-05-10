import { getServerSession } from "@/action/auth.action";
import db from "@/lib/database/db";
import { File } from "@/lib/database/schema/file.model";
import { Subscription } from "@/lib/database/schema/subscription.model";
import { pinata } from "@/lib/pinata/config";
import { getCategoryFromMimeType, parseError } from "@/lib/utils";
import { Hono } from "hono";

const fileRoute = new Hono();

fileRoute.get("/", async (c) => {
    try {
        await db();
        const session = await getServerSession();
        const search = c.req.query("search");

        if (!session) {
            return c.json(
                {
                    message: "Unauthorized",
                    description: "You need to be logged in to search files.",
                },
                { status: 401 }
            );
        }

        if (!search || search.trim() === "") {
            return c.json(
                {
                    message: "⚠️ Warning",
                    description: "Search term is required.",
                },
                { status: 400 }
            );
        }

        const {
            user: { id },
        } = session;

        const files = await File.find({
            "userInfo.id": id,
            name: { $regex: search, $options: "i" },
        }).lean();

        return c.json(
            {
                message: "Success",
                description: "",
                data: files,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error in searching files: ", error);
        const err = parseError(error);
        return c.json(
            {
                message: "Error",
                description: err,
                data: null,
            },
            { status: 500 }
        );
    }
});

fileRoute.get("/:category", async (c) => { // Changed "page" to "category" to be more semantic
    try {
        await db();
        const category = c.req.param("category");
        const page = Number(c.req.query("page") || "1"); // Default to page 1 if not provided
        const session = await getServerSession();
        const FILE_SIZE = 9;

        if (!session) {
            return c.json(
                {
                    messasage: "unauthorized",
                    description: "You need to be logged in to view files.",
                },
                {
                    status: 401,
                }
            );
        }

        const {
            user: { id: userId, email: userEmail },
        } = session;

        // Handle shared file logic
        if (category === "shared") {
            const documentCount = await File.aggregate([
                { $unwind: "$sharedWith" },
                { $match: { "sharedWith.email": userEmail } },
                { $count: "totalDocuments" },
            ]);

            const totalFiles = documentCount.length > 0 ? documentCount[0].totalDocuments : 0;

            const files = await File.aggregate([
                { $unwind: "$sharedWith" },
                { $match: { "sharedWith.email": userEmail } },
                {
                    $group: {
                        _id: "$_id",
                        pinataId: { $first: "$pinataId" },
                        name: { $first: "$name" },
                        cid: { $first: "$cid" },
                        size: { $first: "$size" },
                        mimeType: { $first: "$mimeType" },
                        userInfo: { $first: "$userInfo" },
                        groupId: { $first: "$groupId" },
                        sharedWith: { $first: "$sharedWith" },
                        category: { $first: "$category" },
                        createdAt: { $first: "$createdAt" },
                        updateAt: { $first: "$updateAt" },
                    },
                },
                { $skip: (page - 1) * FILE_SIZE }, // Add pagination for shared files
                { $limit: FILE_SIZE },
                { $sort: { createdAt: -1 } },
            ]);

            return c.json({
                message: "Success",
                description: "",
                data: {
                    files: files,
                    total: totalFiles,
                    currentPage: page,
                    totalPages: Math.ceil(totalFiles / FILE_SIZE),
                },
            }, { status: 200 });
        }

        const totalFiles = await File.countDocuments({ "userInfo.id": userId, category });
        const files = await File.find({ "userInfo.id": userId, category })
            .skip((page - 1) * FILE_SIZE)
            .limit(FILE_SIZE)
            .sort({ createdAt: -1 })
            .lean();

        return c.json({
            message: "Successful",
            description: "",
            data: {
                files: files,
                total: totalFiles,
                currentPage: page,
                totalPages: Math.ceil(totalFiles / FILE_SIZE),
            },
        }, {
            status: 200,
        });
    } catch (error) {
        console.error("Error in fetching files: ", error);
        const err = parseError(error);
        return c.json({
            message: "Error",
            description: err,
            data: null,
        }, {
            status: 500,
        });
    }
});

fileRoute.post("/upload", async (c) => {
    try {
        await db();
        const data = await c.req.formData();
        const file: File | null = data.get("file") as unknown as File;
        const session = await getServerSession();

        if (!session) {
            return c.json(
                {
                    messasage: "unauthorized",
                    description: "You need to be logged in to upload files",
                    file: null,
                },
                {
                    status: 401,
                }
            );
        }

        const userId = session.user.id;
        const name = session.user.name;

        const subs = await Subscription.findOne({ subscriber: userId });
        if (!subs) {
            return c.json({
                message: "⚠️ Warning",
                category: null,
                description: "Subscription not found. Please log out and log in again to refresh your session.",
                file: null,
            }, { status: 404 });
        }
        if (subs.subscriptionType !== "free" && subs.status !== "activated") {
            return c.json(
                {
                    messasage: "unauthorized",
                    description: "Your subscription is not active.",
                    file: null,
                },
                {
                    status: 401,
                }
            );
        }

        if (subs.selectedStorage <= subs.usedStorage) {
            return c.json(
                {
                    messasage: "⚠️ Warning",
                    description: "Storage limit has exceeded. Please subscribe and select additional storage ",
                    file: null,
                }, { status: 400 }
            );
        }

        const uploadData = await pinata.upload.public.file(file).keyvalues({
            userId,
            name,
        });

        const category = getCategoryFromMimeType(uploadData.mime_type);

        const uploadedFile = await File.create({
            pinataId: uploadData.id,
            name: uploadData.name,
            mimeType: uploadData.mime_type,
            cid: uploadData.cid,
            size: uploadData.size,
            userInfo: { id: userId, name },
            category,
        });

        await Subscription.updateOne({ subscriber: userId }, {
            $inc: {
                usedStorage: uploadData.size,
            },
        });

        return c.json(
            {
                messasage: "✅ Upload Successful",
                category,
                description: `✅ ${uploadData.name} Uploaded successfully`,
                file: uploadedFile,
            }, { status: 200 }
        );
    } catch (error) {
        console.error("Error in file uploading", error);
        const err = parseError(error);
        return c.json(
            {
                messasage: "❌ Error",
                description: err,
                file: null,
            }, { status: 500 }
        );
    }
});

export default fileRoute;
