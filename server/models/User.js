import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: false },  // Make 'name' optional
    picture: { type: String, required: false },  // Make 'picture' optional
});

export default mongoose.model('User', UserSchema);
