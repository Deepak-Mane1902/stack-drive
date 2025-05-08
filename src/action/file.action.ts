
"use server"

import axios from "axios";
import { ActionResponse, parseError } from "@/lib/utils";
import {  NEXT_PUBLIC_GATEWAY_URL, PINATA_API_KEY, PINATA_API_SECRET } from "@/lib/constant";
import db from "@/lib/database/db";
import { File, IFile } from "@/lib/database/schema/file.model";
import { pinata } from "@/lib/pinata/config";
import { TRenameFileForm, TShareFileForm } from "@/app/(dashboard)/_components/file-card/menu";

export async function generateUrl(cid: string) {
    try {
        const baseUrl = NEXT_PUBLIC_GATEWAY_URL || "https://maroon-electrical-kiwi-263.mypinata.cloud/ipfs";
        const url = `${baseUrl}/ipfs/${cid}`;

        const pinataApiKey = PINATA_API_KEY; 
        const pinataSecretApiKey = PINATA_API_SECRET;
        console.log(url)

        if (!pinataApiKey || !pinataSecretApiKey) {
            throw new Error("Pinata API credentials are missing");
        }

        const metadata = {
            name: `Pinned CID: ${cid}`,
            keyvalues: { cid },
        };

        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            metadata,
            {
                headers: {
                    pinata_api_key: pinataApiKey,
                    pinata_secret_api_key: pinataSecretApiKey,
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.data || !response.data.IpfsHash) {
            throw new Error("Failed to pin metadata to Pinata");
        }

        return { data: url, status: 201 };
    } catch (error) {
        console.error("Error in generating URL:", error);
        const err = parseError(error);
        return { data: `${err}`, status: 500 };
    }
}

export async function deleteFile(file:IFile){
    await db();
    const {pinataId, category, _id } = file
    await pinata.files.public.delete([pinataId])
    await File.deleteOne({pinataId})

    return {status:200, category, fileId: _id}
}

export  async function updateFilePermissions(file:IFile,values:TShareFileForm){
    try {
        await db()
        const {pinataId} = file
        const newPermission ={
            email:values.email,
            permission:values.permissions,
        }

        const dbFiles = (await File.findOne({pinataId})) as IFile
        const {sharedWith} = dbFiles;
        const allPermission = sharedWith.filter(({email})=> email !== values.email);
        const permissionToSave = [...allPermission, newPermission] 

        await File.updateOne({pinataId},{
            $set:{
                sharedWith:permissionToSave
            }
        })

        return {
            message:`Shared with ${values.email}`,
            description:`${values.permissions}`,
            status:200,
        };

    } catch (error) {
            console.log("Error in updating files:",error);
            const err = parseError(error);
            return {
                message:"Error",
                description:err,
                status:500,
            }
            
    }
}
 
export async function renameFile({
    file,
    values,
  }: {
    file: IFile;
    values: TRenameFileForm;
  }) {
    try {
      await db();
  
      const { pinataId } = file;
  
      const { name } = values;
  
      const updatedFile = await File.findOneAndUpdate(
        { pinataId },
        { name },
        { new: true } // Return the updated document
      );
  
      return ActionResponse({
        message: "Rename Successful",
        description: `New name: ${name}`,
        status: 200,
        file: updatedFile,
      });
    } catch (error) {
      console.log("Error in renaming file: ", error);
      const err = parseError(error);
  
      return ActionResponse({
        message: "Error",
        description: `${err}`,
        status: 500,
        file: null,
      });
    }
  }