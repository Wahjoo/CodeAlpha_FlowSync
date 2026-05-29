import mongoose from 'mongoose';

const supportArticleSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    readTime: {
      type: String, // e.g., "5 min read"
      required: true,
    },
    lastUpdated: {
      type: String, // e.g., "Last updated 2 days ago"
      required: true,
    },
    icon: {
      type: String, // e.g., "fa-file-lines"
      default: 'fa-file-lines',
    },
    url: {
      type: String, // Link to full article if it existed
      default: '#',
    }
  },
  {
    timestamps: true,
  }
);

const SupportArticle = mongoose.model('SupportArticle', supportArticleSchema);

export default SupportArticle;
