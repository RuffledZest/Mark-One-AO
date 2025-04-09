"use client";

import React, { useEffect, useState, useContext } from "react";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { Button } from "@/components/ui/button";
import { useConvex, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import DashboardHeader from "./_components/DashboardHeader";
import DashboardTable from "./_components/DashboardTable";
import { FileListContext } from "@/app/_context/FileListContext";
import InviteDialog from "@/app/_components/InviteDialog";
import InvitationsList from "@/app/_components/InvitationsList";

const page = () => {
  const { user } = useKindeBrowserClient();
  const convex = useConvex();
  const router = useRouter();
  const createUser = useMutation(api.user.createUser);
  const { fileList, setFileList } = useContext(FileListContext);
  const [activeTeam, setActiveTeam] = useState<any>();

  useEffect(() => {
    if (user) {
      checkUser();
      getTeams();
    }
  }, [user]);

  const checkUser = async () => {
    const result = await convex.query(api.user.getUser, {
      email: user?.email!,
    });
    if (!result) {
      createUser({
        name: user?.given_name!,
        email: user?.email!,
        image: user?.picture!,
      }).then((resp) => {
        if (resp) {
          router.push("/team/create");
        }
      });
    }
  };

  const getTeams = async () => {
    const result = await convex.query(api.teams.getTeams, {
      email: user?.email!,
    });
    if (result && result.length > 0) {
      setActiveTeam(result[0]);
    }
  };

  return (
    <div className="text-white">
      <DashboardHeader user={user} />
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          {activeTeam && <InviteDialog teamId={activeTeam._id} />}
        </div>
        <InvitationsList />
        <DashboardTable />
      </div>
    </div>
  );
};

export default page;

