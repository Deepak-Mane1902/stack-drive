"use client";

import { useEffect, useState } from "react";
import { initializePaddle, Paddle } from "@paddle/paddle-js";
import { NEXT_PUBLIC_PADDLE_CLIENT_TOKEN } from "@/lib/env";
import { parseError } from "@/lib/utils";
import { toast } from "sonner";


const usePaddle = () => {
  const [paddle, setPaddle] = useState<Paddle>();

  useEffect(() => {
    async function initiatePaddle() {
      if (paddle?.Initialize) return;

      try {
        const paddleInstance = await initializePaddle({
          environment: process.env.NODE_ENV === "production" ? "production" : "sandbox",
          token: NEXT_PUBLIC_PADDLE_CLIENT_TOKEN,
          eventCallback: (data) => console.log("Paddle event:", data),
          checkout: {
            settings: {
              displayMode: "overlay",
              theme: "dark",
              locale: "en",
            },
          },
        });

        if (paddleInstance) setPaddle(paddleInstance);
      } catch (error) {
        console.error("Error initializing Paddle: ", error);
        const err = parseError(error);
        toast("Error", { description: err });
      }
    }

    initiatePaddle();
  }, [paddle]);

  return paddle;
};

export default usePaddle;
