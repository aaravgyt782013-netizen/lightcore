import assert from "node:assert/strict";
import test from "node:test";
import { checkCommandAccess } from "../src/lib/permissions.js";

const ownerId = "123456789012345678";
const moderatorId = "234567890123456789";

test("allows a normal command without additional permission requirements", () => {
  const result = checkCommandAccess(
    {},
    { userId: moderatorId, guildId: "345678901234567890", memberPermissions: null },
    ownerId
  );
  assert.deepEqual(result, { allowed: true });
});

test("denies owner-only commands to other users", () => {
  const result = checkCommandAccess(
    { ownerOnly: true },
    { userId: moderatorId, guildId: "345678901234567890", memberPermissions: null },
    ownerId
  );
  assert.deepEqual(result, { allowed: false, reason: "owner_only" });
});

test("allows the configured owner to use owner-only commands", () => {
  const result = checkCommandAccess(
    { ownerOnly: true },
    { userId: ownerId, guildId: "345678901234567890", memberPermissions: null },
    ownerId
  );
  assert.deepEqual(result, { allowed: true });
});

test("denies guild-only commands in DMs", () => {
  const result = checkCommandAccess(
    { guildOnly: true },
    { userId: moderatorId, guildId: null, memberPermissions: null },
    ownerId
  );
  assert.deepEqual(result, { allowed: false, reason: "guild_only" });
});

test("denies users missing a required Discord permission", () => {
  const result = checkCommandAccess(
    { requiredPermissions: "ManageGuild" },
    {
      userId: moderatorId,
      guildId: "345678901234567890",
      memberPermissions: { has: () => false }
    },
    ownerId
  );
  assert.deepEqual(result, { allowed: false, reason: "missing_permissions" });
});

test("allows users with the required Discord permission", () => {
  const result = checkCommandAccess(
    { requiredPermissions: "ManageGuild" },
    {
      userId: moderatorId,
      guildId: "345678901234567890",
      memberPermissions: { has: () => true }
    },
    ownerId
  );
  assert.deepEqual(result, { allowed: true });
});
