import { IFile } from '@/lib/database/schema/file.model'
import { cn, formatFileSize } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import FileMenu from './menu';
import { P } from '@/components/ui/custom/p';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { useState } from 'react';
import { generateUrl } from '@/action/file.action';

const FileCard = ({file}:{file: IFile}) => {
  const [isLinkInProgress, setIsLinkInProgress] = useState(false)

  const {name, size, createdAt, userInfo, category} = file;
  const requiredName = `${name.slice(0,16)}... ${name.split(".")[1]}`
  const formatedFileSize = formatFileSize(size)

  return (
    <Card className='w-full max-auto bg-[#383838] text-white border-none shadow-none drop-shadow-xl'> 
      <CardHeader>
        <div className="flex items-start gap-4 justify-between">
          <Avatar className='size-20 rounded-none'>
            <AvatarImage src={`/${category}.png`} />
            <AvatarFallback>{name.slice(0,2)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-end gap-4 justify-between w-full">
            <FileMenu file={file} isLinkInProgress={isLinkInProgress} setIsLinkInProgress={setIsLinkInProgress}/>

            <P>{formatedFileSize}</P>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 ">
        <P
          size="large"
          weight="bold"
          className={cn(category === "image" && "cursor-pointer")}
          onClick={async () => {
            if (category === "image") {
              setIsLinkInProgress(true);
          
              try {
                console.log("Generating URL...");
                const { data, status } = await generateUrl(file.cid);
                if (status !== 201) {
                  toast("Error", {
                    description: `${data}`,
                    className: "text-black",
                  });
                  setIsLinkInProgress(false);
                  return;
                }
          
                console.log(data,"Opening in new tab...");
                window.open(data, "_blank");
              } catch (error) {
                console.error("Error opening the file:", error);
                toast("Error", {
                  description: "Failed to open the file. Please try again.",
                  className: "text-black",
                });
              } finally {
                setIsLinkInProgress(false);
              }
            }
          }}
        >
          {requiredName}
        </P>
        <P size="small" weight="light" variant="muted" className="text-[#c2c2c2]">
          {format(createdAt, "dd-MM-yyyy")}
        </P>
        <P size="small" weight="light" variant="muted" className="text-[#d6d6d6]">
          Uploaded By: <b>{userInfo.name}</b>
        </P>
      </CardContent>
    </Card>
  )
}

export default FileCard;
