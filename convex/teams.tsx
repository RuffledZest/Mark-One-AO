import { v } from "convex/values";

import { mutation, query } from "./_generated/server";

export const getTeams = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Get teams where user is creator
    const createdTeams = await ctx.db
      .query("teams")
      .filter((q) => q.eq(q.field("createdBy"), args.email))
      .collect();

    // Get teams where user is a member
    const memberTeams = await ctx.db
      .query("teamMembers")
      .filter((q) => q.eq(q.field("userId"), args.email))
      .collect();

    // Get team details for member teams
    const memberTeamIds = memberTeams.map(member => member.teamId);
    const memberTeamDetails = await Promise.all(
      memberTeamIds.map(teamId => ctx.db.get(teamId))
    );

    // Filter out any null values and combine the lists
    const allTeams = [...createdTeams, ...memberTeamDetails.filter(Boolean)];

    // Remove duplicates based on team ID
    const uniqueTeams = allTeams.filter((team, index, self) =>
      index === self.findIndex((t) => t._id === team._id)
    );

    return uniqueTeams;
  },
});

export const createTeam = mutation({
  args: {
    teamName: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Creating team:", args.teamName);
    console.log("Created by:", args.createdBy);

    // First check if a team with the same name already exists for this user
    const existingTeam = await ctx.db
      .query("teams")
      .filter((q) => 
        q.and(
          q.eq(q.field("name"), args.teamName),
          q.eq(q.field("createdBy"), args.createdBy)
        )
      )
      .first();

    if (existingTeam) {
      console.log("Team with same name exists:", existingTeam);
      throw new Error("A team with this name already exists");
    }

    // Create the team
    const teamId = await ctx.db.insert("teams", {
      name: args.teamName,
      createdBy: args.createdBy,
      createdAt: Date.now(),
    });

    console.log("Team created with ID:", teamId);

    // Clean up any stale memberships
    await ctx.db
      .query("teamMembers")
      .filter((q) => q.eq(q.field("teamId"), teamId))
      .collect()
      .then(async (members) => {
        for (const member of members) {
          await ctx.db.delete(member._id);
        }
      });

    // Add creator as admin member
    await ctx.db.insert("teamMembers", {
      teamId,
      userId: args.createdBy,
      role: "admin",
      joinedAt: Date.now(),
    });

    console.log("Creator added as admin member");
    return teamId;
  },
});

export const deleteTeam = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // Get the team to check if the user is the creator
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Delete all team members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    for (const member of teamMembers) {
      await ctx.db.delete(member._id);
    }

    // Delete all invitations
    const invitations = await ctx.db
      .query("invitations")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    for (const invitation of invitations) {
      await ctx.db.delete(invitation._id);
    }

    // Delete the team
    await ctx.db.delete(args.teamId);
  },
});

export const sendInvitation = mutation({
  args: {
    teamId: v.id("teams"),
    email: v.string(),
    invitedBy: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Sending invitation for team:", args.teamId);
    console.log("To email:", args.email);
    console.log("From:", args.invitedBy);

    // First check if the team exists
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      console.log("Team not found:", args.teamId);
      throw new Error("Team not found");
    }
    console.log("Team found:", team);

    // Check if user is already a member
    const existingMember = await ctx.db
      .query("teamMembers")
      .filter((q) => 
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("userId"), args.email)
        )
      )
      .first();

    if (existingMember) {
      console.log("Existing member found for team:", args.teamId);
      console.log("Member details:", existingMember);
      throw new Error("User is already a member of this team");
    }

    // Check for existing pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .filter((q) => 
        q.and(
          q.eq(q.field("teamId"), args.teamId),
          q.eq(q.field("email"), args.email),
          q.eq(q.field("status"), "pending")
        )
      )
      .first();

    if (existingInvitation) {
      console.log("Existing invitation found:", existingInvitation);
      throw new Error("Invitation already sent to this user");
    }

    // Create new invitation
    const invitation = await ctx.db.insert("invitations", {
      teamId: args.teamId,
      email: args.email,
      invitedBy: args.invitedBy,
      status: "pending",
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    });

    console.log("Invitation created successfully:", invitation);
    return invitation;
  },
});

export const acceptInvitation = mutation({
  args: {
    invitationId: v.id("invitations"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const invitation = await ctx.db.get(args.invitationId);
    
    if (!invitation) {
      throw new Error("Invitation not found");
    }

    if (invitation.status !== "pending") {
      throw new Error("Invitation is no longer valid");
    }

    if (invitation.email !== args.email) {
      throw new Error("This invitation is not for you");
    }

    if (Date.now() > invitation.expiresAt) {
      throw new Error("Invitation has expired");
    }

    // Get the team details
    const team = await ctx.db.get(invitation.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Add user as team member
    await ctx.db.insert("teamMembers", {
      teamId: invitation.teamId,
      userId: args.email,
      role: "member",
      joinedAt: Date.now(),
    });

    // Update invitation status
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
    });

    // Return both team ID and team details
    return {
      teamId: invitation.teamId,
      team,
    };
  },
});

export const getPendingInvitations = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("invitations")
      .filter((q) => 
        q.and(
          q.eq(q.field("email"), args.email),
          q.eq(q.field("status"), "pending")
        )
      )
      .collect();
  },
});

export const cleanupStaleMemberships = mutation({
  args: {
    teamId: v.id("teams"),
  },
  handler: async (ctx, args) => {
    // Get all team members
    const teamMembers = await ctx.db
      .query("teamMembers")
      .filter((q) => q.eq(q.field("teamId"), args.teamId))
      .collect();

    // Get the team
    const team = await ctx.db.get(args.teamId);
    if (!team) {
      throw new Error("Team not found");
    }

    // Delete any team memberships that don't match the team's creator
    for (const member of teamMembers) {
      if (member.userId !== team.createdBy) {
        await ctx.db.delete(member._id);
      }
    }

    return true;
  },
});
