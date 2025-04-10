"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function InvitationsList() {
  const { user } = useKindeBrowserClient();
  const router = useRouter();
  const pendingInvitations = useQuery(api.teams.getPendingInvitations, user?.email ? {
    email: user.email
  } : "skip");
  const acceptInvitation = useMutation(api.teams.acceptInvitation);

  const handleAcceptInvitation = async (invitationId: Id<"invitations">) => {
    try {
      const result = await acceptInvitation({
        invitationId,
        email: user?.email!,
      });
      toast.success("Invitation accepted successfully");
      // Force a refresh of the page to update the team list
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to accept invitation");
    }
  };

  if (!pendingInvitations?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pending Invitations</h2>
      {pendingInvitations.map((invitation) => (
        <Card key={invitation._id} className="bg-neutral-800 border-neutral-700">
          <CardHeader>
            <CardTitle className="text-white">
              Team: {invitation.teamId}
            </CardTitle>
            <CardDescription>
              Invited by: {invitation.invitedBy}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => handleAcceptInvitation(invitation._id)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              Accept Invitation
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
} 