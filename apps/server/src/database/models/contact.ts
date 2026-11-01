import mongoose, { Schema, type Model } from "mongoose";

export interface IContact {
  owner: mongoose.Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  company?: mongoose.Types.ObjectId | null;
  jobTitle?: string;
  contactType: "lead" | "client" | "former_client" | "partner";
  tags: string[];
  website?: string;
  notes?: string;
  source?: string;
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      default: null,
    },
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },
    contactType: {
      type: String,
      enum: ["lead", "client", "former_client", "partner"],
      default: "lead",
    },
    tags: {
      type: [String],
      default: [],
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      default: "",
    },
    source: {
      type: String,
      trim: true,
      default: "",
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

contactSchema.index({ owner: 1, email: 1 }, { unique: true, sparse: true });
contactSchema.index({ owner: 1, lastName: 1, firstName: 1 });
contactSchema.index({ owner: 1, company: 1 });

export const Contact: Model<IContact> = mongoose.model<IContact>(
  "Contact",
  contactSchema,
);
