import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  Activity,
  Company,
  Contact,
  Deal,
  DealHistory,
  Notification,
  PipelineStage,
  Task,
  User,
} from "./models/index.js";

describe("Relio database models", () => {
  it("exposes the required domain models", () => {
    assert.equal(User.modelName, "User");
    assert.equal(Contact.modelName, "Contact");
    assert.equal(Company.modelName, "Company");
    assert.equal(PipelineStage.modelName, "PipelineStage");
    assert.equal(Deal.modelName, "Deal");
    assert.equal(Task.modelName, "Task");
    assert.equal(Activity.modelName, "Activity");
    assert.equal(DealHistory.modelName, "DealHistory");
    assert.equal(Notification.modelName, "Notification");
  });

  it("uses owner references and unique identity constraints for user-owned data", () => {
    assert.equal(User.schema.path("email").options.unique, true);
    assert.equal(User.schema.path("username").options.unique, true);
    assert.equal(Deal.schema.path("owner").options.ref, "User");
    assert.equal(Task.schema.path("owner").options.ref, "User");
    assert.equal(Activity.schema.path("owner").options.ref, "User");
  });

  it("defines the required user profile defaults and authentication fields", () => {
    const avatarDefault = User.schema.path("avatarUrl").options.default;
    const themeDefault = User.schema.path("themePreference").options.default;
    const passwordDefault = User.schema.path("passwordHash").options.default;
    const googleIndex = User.schema.path("googleId").options.index;

    assert.equal(avatarDefault, "");
    assert.equal(themeDefault, "system");
    assert.equal(passwordDefault, "");
    assert.equal(googleIndex, true);
    assert.equal(User.schema.path("isGoogleUser").options.default, false);
    assert.equal(User.schema.path("isActive").options.default, true);
    assert.equal(User.schema.path("lastLoginAt").options.default, null);
    assert.equal(User.schema.path("displayName").instance, "String");
  });

  it("defines the required contact profile fields and relationship rules", () => {
    const contactTypePath = Contact.schema.path("contactType") as any;

    assert.equal(Contact.schema.path("firstName").options.required, true);
    assert.equal(Contact.schema.path("lastName").options.required, true);
    assert.equal(Contact.schema.path("owner").options.ref, "User");
    assert.equal(Contact.schema.path("company").options.ref, "Company");
    assert.equal(Contact.schema.path("jobTitle").instance, "String");
    assert.deepEqual(contactTypePath.enumValues, [
      "lead",
      "client",
      "former_client",
      "partner",
    ]);
    assert.equal(Contact.schema.path("tags").instance, "Array");
  });

  it("defines the required company fields and owner-scoped identity", () => {
    assert.equal(Company.schema.path("name").options.required, true);
    assert.equal(Company.schema.path("owner").options.ref, "User");
    assert.equal(Company.schema.path("website").instance, "String");
    assert.equal(Company.schema.path("industry").instance, "String");
    assert.equal(Company.schema.path("annualRevenue").instance, "Number");
    assert.equal(Company.schema.path("logoUrl").instance, "String");
    assert.equal(Company.schema.path("tags").instance, "Array");
    assert.equal(Company.schema.path("address").instance, "Embedded");
  });
});
