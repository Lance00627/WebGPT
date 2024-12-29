import { Analytics } from "@vercel/analytics/react";
import { auth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { Home } from "./components/home";
import { getServerSideConfig } from "./config/server";

const serverConfig = getServerSideConfig();

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <>
      <Home />
      {serverConfig?.isVercel && (
        <>
          <Analytics />
        </>
      )}
    </>
  );
}
