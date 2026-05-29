import mongoose from 'mongoose';

const linkSchema = mongoose.Schema({
  title: { type: String, required: true },
  url: { type: String, default: '#' }
}, { _id: false });

const supportCategorySchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String, // e.g. "fa-rocket"
      required: true,
    },
    links: [linkSchema], // For nested links like "Workspace Setup", "User Roles"
    isFeatured: {
      type: Boolean, // True for the large card
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

const SupportCategory = mongoose.model('SupportCategory', supportCategorySchema);

export default SupportCategory;
