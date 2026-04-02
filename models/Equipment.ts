import mongoose from "mongoose";

const EquipmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      enum: ["Tractor", "Harvester", "Irrigation", "Other"],
      index: true,
    },

    description: {
      type: String,
      trim: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["available", "in_use", "maintenance"],
      default: "available",
      index: true,
    },



    specs: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);


EquipmentSchema.index({ name: "text", description: "text" });

export default mongoose.models.Equipment ||
  mongoose.model("Equipment", EquipmentSchema);