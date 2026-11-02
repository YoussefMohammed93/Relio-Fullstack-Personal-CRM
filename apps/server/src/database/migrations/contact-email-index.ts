import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { connectDatabase } from "../connect.js";
import { Contact } from "../models/contact.js";

async function migrateContactEmailIndex() {
  if (env.NODE_ENV !== "development") {
    throw new Error("Contact email index migration is restricted to development");
  }
  Contact.schema.set("autoIndex", false);
  await connectDatabase();

  try {
    const indexes = await Contact.collection.indexes();
    const emailIndex = indexes.find((index) => index.name === "owner_1_email_1");

    if (emailIndex?.unique) {
      await Contact.collection.dropIndex("owner_1_email_1");
    }

    await Contact.collection.createIndex(
      { owner: 1, email: 1 },
      { name: "owner_1_email_1" },
    );
    console.info("Contact email index is non-unique.");
  } finally {
    await mongoose.disconnect();
  }
}

await migrateContactEmailIndex();
