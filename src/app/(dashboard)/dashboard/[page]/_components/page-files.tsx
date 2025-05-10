"use client";

import FileCard from "@/app/(dashboard)/_components/file-card/card";
import { P } from "@/components/ui/custom/p";
import { IFile } from "@/lib/database/schema/file.model";
import { getFiles } from "@/lib/fetch/files.fetch";
import { RiLoader3Fill } from "@remixicon/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { toast } from "sonner";

interface PageFilesProps {
    page: string;
}

const PageFiles = ({ page }: PageFilesProps) => {
    const { ref, inView } = useInView();
    const [currentPage, setCurrentPage] = useState(1);
    const [isPageFull, setIsPageFull] = useState(false);
    const queryClient = useQueryClient();

    const { data, isLoading: initialLoading, error: fetchError, isFetching } = useQuery({
        queryKey: ["files", page, currentPage],
        queryFn: async () => await getFiles({ page, currentPage }),
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
    });

    const mutation = useMutation({
        mutationFn: ({ page, currentPage }: { page: string; currentPage: number }) => getFiles({ page, currentPage }),
        onSuccess: (newData) => {
            if (newData?.totalPages && currentPage === newData.totalPages) {
                setIsPageFull(true);
            }

            queryClient.setQueryData(["files", page], (oldData: unknown) => {
                const oldFiles = (oldData as { files: IFile[] } | undefined)?.files || [];
                const newFiles = newData?.files as IFile[] || [];

                const mergedFiles = [
                    ...oldFiles,
                    ...newFiles.filter(
                        (newFile) =>
                            !oldFiles.some((oldFile) => oldFile._id === newFile._id)
                    ),
                ];

                return {
                    files: mergedFiles,
                    total: newData?.total,
                    currentPage: newData?.currentPage,
                    totalPages: newData?.totalPages,
                };
            });
        },
        onError(error: AxiosError<{ message?: string }>) {
            toast(error?.response?.data?.message || error?.message || "Failed to load files.", {
                description: error?.message,
            });
        },
    });

    useEffect(() => {
        if (data?.totalPages && currentPage === data.totalPages) {
            setIsPageFull(true);
            return;
        }

        if (inView && !isPageFull && !isFetching && mutation.status !== "pending") { // Correctly access mutation status
            setCurrentPage((prev) => {
                const nextPage = prev + 1;
                mutation.mutateAsync({ page, currentPage: nextPage });
                return nextPage;
            });
        }
    }, [inView, data?.totalPages, currentPage, isPageFull, isFetching, mutation.status, mutation, page]);

    if (initialLoading) return <RiLoader3Fill className="animate-spin mx-auto" />;

    if (fetchError)
        return (
            <P size="large" weight="bold">
                Error: {fetchError.message}
            </P>
        );

    const files = data?.files as IFile[] || [];

    if (files?.length === 0 && !initialLoading)
        return (
            <Image
                src="/not-found.png"
                width={400}
                height={400}
                className="m-auto"
                alt="not-found"
            />
        );

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-4 gap-y-6">
                {files.map((file) => (
                    <FileCard file={file} key={file._id} />
                ))}
            </div>

            {!initialLoading && !isPageFull && (
                <div
                    ref={ref}
                    className="w-full flex h-fit items-center justify-center"
                >
                    <div className="py-3">
                        {(inView || isFetching || mutation.status === "pending") && <RiLoader3Fill className="animate-spin" />}
                    </div>
                </div>
            )}
        </>
    );
};

export default PageFiles;
