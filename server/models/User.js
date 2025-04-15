import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: false },  
    picture: { type: String, required: false }, 
    role: { type: String, default: "client", }, 
});

export default mongoose.model('User', UserSchema);
