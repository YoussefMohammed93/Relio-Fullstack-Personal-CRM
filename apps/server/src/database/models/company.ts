import mongoose, { Schema, type Model } from "mongoose";

export interface ICompany {
  owner: mongoose.Types.ObjectId;
  name: string;
  website?: string;
  industry?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  description?: string;
  companySize?: string;
  annualRevenue?: number;
  linkedInUrl?: string;
  logoUrl?: string;
  tags: string[];
  archivedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const addressSchema = new Schema(
  {
    street: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    state: { type: String, trim: true, default: "" },
    postalCode: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "" },
  },
  { _id: false },
);

const companySchema = new Schema<ICompany>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      default: "",
    },
    industry: {
      type: String,
      trim: true,
      default: "",
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
    address: {
      type: addressSchema,
      default: () => ({}),
    },
    description: {
      type: String,
      default: "",
    },
    companySize: {
      type: String,
      trim: true,
      default: "",
    },
    annualRevenue: {
      type: Number,
      min: 0,
      default: null,
    },
    linkedInUrl: {
      type: String,
      trim: true,
      default: "",
    },
    logoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    tags: {
      type: [String],
      default: [],
    },
    archivedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

companySchema.index({ owner: 1, name: 1 }, { unique: true });
companySchema.index({ owner: 1, industry: 1 });

export const Company: Model<ICompany> = mongoose.model<ICompany>(
  "Company",
  companySchema,
);
