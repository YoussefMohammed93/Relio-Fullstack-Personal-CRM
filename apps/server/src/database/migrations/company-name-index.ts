import mongoose from "mongoose";
import { env } from "../../config/env.js";
import { connectDatabase } from "../connect.js";
import { Company } from "../models/company.js";

async function migrateCompanyNameIndex() {
  if (env.NODE_ENV !== "development") {
    throw new Error("Company name index migration is restricted to development");
  }
  Company.schema.set("autoIndex", false);
  await connectDatabase();

  try {
    const indexes = await Company.collection.indexes();
    const nameIndex = indexes.find((index) => index.name === "owner_1_name_1");

    if (nameIndex) {
      await Company.collection.dropIndex("owner_1_name_1");
    }

    await Company.collection.createIndex(
      { owner: 1, name: 1 },
      { name: "owner_1_name_1" },
    );
    console.info("Company name index is non-unique.");
  } finally {
    await mongoose.disconnect();
  }
}

await migrateCompanyNameIndex();
