import mongoose from 'mongoose';

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  dosage: {
    type: String, // e.g., "500mg", "1 tablet"
  },
  frequency: {
    type: String, // e.g., "Twice a day", "Once daily at night"
  },
  duration: {
    type: String, // e.g., "5 days", "1 week"
  },
  instructions: {
    type: String, // e.g., "Take after food", "Avoid dairy"
  },
});

const PrescriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    medicines: [MedicineSchema],
    tests: [
      {
        type: String, // e.g., "CBC (Complete Blood Count)", "Fasting Blood Sugar"
      },
    ],
    ultrasounds: [
      {
        type: String, // e.g., "Whole Abdomen Ultrasound"
      },
    ],
    precautions: [
      {
        type: String, // Precautions written explicitly on the prescription
      },
    ],
  },
  {
    timestamps: true,
  }
);

// If the Prescription model already exists in Mongoose, compile from cache, otherwise compile new model
export default mongoose.models.Prescription || mongoose.model('Prescription', PrescriptionSchema);
