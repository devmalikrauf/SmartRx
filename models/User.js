import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// If the User model already exists in Mongoose, compile from cache, otherwise compile new model
export default mongoose.models.User || mongoose.model('User', UserSchema);
