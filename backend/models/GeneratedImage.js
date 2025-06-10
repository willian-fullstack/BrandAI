import mongoose from 'mongoose';

const generatedImageSchema = mongoose.Schema(
  {
    usuario_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    prompt: {
      type: String,
      required: true
    },
    processed_prompt: {
      type: String,
      required: true
    },
    image_url: {
      type: String,
      required: true
    },
    agente_id: {
      type: String,
      required: false
    },
    size: {
      type: String,
      required: true,
      enum: ['1024x1024', '1024x1792', '1792x1024']
    },
    used_documents: [{
      type: String
    }],
    reference_image_used: {
      type: Boolean,
      default: false
    },
    text_overlay: {
      type: String,
      required: false
    }
  },
  {
    timestamps: true
  }
);

const GeneratedImage = mongoose.model('GeneratedImage', generatedImageSchema);

export default GeneratedImage; 