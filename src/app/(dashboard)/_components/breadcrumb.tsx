"use client"
import {
     Breadcrumb,
     BreadcrumbItem,
     BreadcrumbLink,
     BreadcrumbList,
     BreadcrumbPage,
     BreadcrumbSeparator,
   } from "@/components/ui/breadcrumb"
import { paragraphVariants } from "@/components/ui/custom/p"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
   
   import React from 'react'
   
   const DashboardBreadcrumb = () => {
     const pathname = usePathname();

     const paths = pathname.split("/").filter(path =>path !=="")
     return (
          <Breadcrumb>
          <BreadcrumbList>
          {
               paths.length>1 && paths.map((path, i)=>{
                    const isLast = i === paths.length - 1
                    const currentPath  = paths.find((_,index)=> index === i)

                    return (
                         <div key={i} className="flex item-center justify-start gap-3 ">
                              {
                                   !isLast ?(
                                        <>
                                        <BreadcrumbItem>
                                             <BreadcrumbLink className={cn(paragraphVariants({
                                             size:"small",
                                             weight:"medium"
                                        }), "capitalize text-[#c2c2c2] hover:text-[#d6d6d6] cursor-pointer"
                                        )}
                                        href={`/${currentPath}`}>
                                             {path}
                                             </BreadcrumbLink>
                                        </BreadcrumbItem> 
                                        <BreadcrumbSeparator/>
                                        </>
                                   ) : (
                                        <BreadcrumbItem>
                                        <BreadcrumbPage className={cn(paragraphVariants({
                                        size:"small",
                                        weight:"bold"
                                   }), "capitalize text-[#c2c2c2] hover:text-[#d6d6d6] cursor-pointer"
                                   )}>
                                        {path}
                                        </BreadcrumbPage>
                                   </BreadcrumbItem>    
                                   )
                              }
                         </div>
                    )
               })


          }
          </BreadcrumbList>
        </Breadcrumb>
        
     )
   }
   
   export default DashboardBreadcrumb