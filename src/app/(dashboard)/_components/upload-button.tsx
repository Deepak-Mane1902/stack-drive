"use client";

import { Button } from '@/components/ui/button';
import { RiFileAddFill } from '@remixicon/react';
import React, { ChangeEvent, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { P } from '@/components/ui/custom/p';
import { IFile } from '@/lib/database/schema/file.model';
import { useMounted } from '@/hooks/useMounted';

const UploadButton = () => {
  const queryClient = useQueryClient();
  const [fileProgress, setFileProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);
  const mounted = useMounted();

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const res = await axios.post("/api/v1/files/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        const total = progressEvent.total || 1;
        const loaded = progressEvent.loaded;
        const percent = Math.round((loaded / total) * 100);

        setFileProgress((prev) => ({
          ...prev,
          [file.name]: percent,
        }));
      },
    });

    return res.data;
  }

  const mutation = useMutation({
    mutationFn: uploadFile,
    onSuccess: (newData) => {
      queryClient.setQueryData(["files", newData.category], (oldData: { files: IFile[] }) => {
        const uploadedFile = newData.file;
        const oldFiles = oldData?.files || [];

        const newMergedFiles = [uploadedFile, ...oldFiles];
        return { ...oldData, files: newMergedFiles };
      });

      toast(newData?.message, {
        description: newData?.description,
      });
    },
    onError: (error) => {
      toast(error.name, {
        description: error.message,
      });
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      toast("No file selected", {
        description: "Please select a valid file to upload.",
      });
      return;
    }

    const progressMap: Record<string, number> = {};
    files.forEach((file) => {
      progressMap[file.name] = 0;
    });

    setFileProgress(progressMap);
    setIsUploading(true);

    await Promise.all(files.map((file) => mutation.mutateAsync(file)));
    e.target.value = "";
  }

  if (!mounted) {
    return null;
  }

  return (
    <>
      {isUploading &&
        Object.entries(fileProgress).map(([fileName, progress], i) => (
          <TooltipProvider key={i}>
            <Tooltip>
              <TooltipTrigger>
                <div className="relative size-9 rounded-full flex items-center justify-center drop-shadow-md cursor-default animate-pulse">
                  <svg className="absolute w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle
                      className="text-gray-300"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                    />
                    <circle
                      className="text-primary"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      fill="transparent"
                      r="16"
                      cx="18"
                      cy="18"
                      strokeDasharray="100"
                      strokeDashoffset={100 - progress}
                    />
                  </svg>
                  <P className="text-xs text-primary font-bold">{progress}%</P>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <P className="text-xs font-bold">{fileName}</P>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}

      <Button
        className="cursor-pointer"
        onClick={() => {
          document.getElementById("file-upload")?.click();
        }}
      >
        <RiFileAddFill />
        Upload
      </Button>

      <input
        type="file"
        className="hidden cursor-pointer"
        id="file-upload"
        multiple
        onChange={handleFileChange}
      />
    </>
  );
};

export default UploadButton;
