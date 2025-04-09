"use client";

import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Plus, Settings, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useConvex, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface Team {
  _id: string;
  name: string;
  createdBy: string;
}

const SidebarTopButton = ({ user, setActiveTeamInfo }: any) => {
  const router = useRouter();
  const convex = useConvex();
  const deleteTeam = useMutation(api.teams.deleteTeam);
  const menu = [
    {
      id: 1,
      name: "create team",
      path: "/team/create",
      icon: <Plus size={16} className="mr-2" />,
    },
    {
      id: 2,
      name: "settings",
      path: "/settings",
      icon: <Settings size={16} className="mr-2" />,
    },
  ];
  const [activeTeam, setActiveTeam] = useState<Team>();
  let [teamList, setTeamList] = useState([] as Team[]);

  const getTeamList = async () => {
    const result = await convex.query(api.teams.getTeams, {
      email: user?.email!,
    });
    // Remove duplicates based on team ID
    const uniqueTeams = result.filter((team, index, self) =>
      index === self.findIndex((t) => t._id === team._id)
    );
    setTeamList(uniqueTeams as Team[]);
    setActiveTeam(uniqueTeams[0]);
    return uniqueTeams;
  };

  useEffect(() => {
    if (user) {
      getTeamList();
    }
  }, [user]);

  useEffect(() => {
    activeTeam ? setActiveTeamInfo(activeTeam) : null;
  }, [activeTeam]);

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await deleteTeam({ teamId });
      toast.success("Team deleted successfully");
      getTeamList();
    } catch (error) {
      toast.error("Failed to delete team");
    }
  };

  let [isOpen, setIsOpen] = useState(false);
  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild className="outline-none">
        <div
          className={cn(
            "flex items-center w-fit hover:bg-neutral-600 gap-2 cursor-pointer rounded-md px-2 mt-4 ml-2",
            { "bg-neutral-600": isOpen }
          )}
        >
          <img src="/logo.svg" alt="logo" className="w-8 h-8" />
          <h2 className="text-sm font-semibold">{activeTeam?.name}</h2>
          <ChevronDown size={16} />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-neutral-800 gap-1 rounded-lg text-white border-neutral-600 w-60 ml-4 mt-2">
        {teamList &&
          teamList.map((team) => (
            <div key={team._id} className="flex items-center justify-between">
              <DropdownMenuItem
                onClick={() => setActiveTeam(team)}
                className={cn(
                  "cursor-pointer focus:bg-neutral-700 focus:text-white flex-1",
                  {
                    "bg-blue-500 text-white":
                      activeTeam?._id === team._id,
                  }
                )}
              >
                {team.name}
              </DropdownMenuItem>
              {team.createdBy === user?.email && (
                <DropdownMenuItem
                  onClick={() => handleDeleteTeam(team._id)}
                  className="cursor-pointer focus:bg-neutral-700 focus:text-white p-2"
                >
                  <Trash2 size={16} className="text-red-500" />
                </DropdownMenuItem>
              )}
            </div>
          ))}

        <DropdownMenuSeparator className="bg-neutral-600" />
        {menu.map((item) => (
          <DropdownMenuItem
            key={item.id}
            onClick={() => {
              router.push(item.path);
            }}
            className="cursor-pointer focus:bg-neutral-700 focus:text-white"
          >
            {item.icon}
            {item.name}
          </DropdownMenuItem>
        ))}
        <LogoutLink>
          <DropdownMenuItem className="cursor-pointer focus:bg-neutral-700 focus:text-white">
            <LogOut size={16} className="mr-2" />
            Logout
          </DropdownMenuItem>
        </LogoutLink>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SidebarTopButton;
