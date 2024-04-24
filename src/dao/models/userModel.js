import mongoose from "mongoose";

const userCollection = "users";

const userSchema = mongoose.Schema({
    user: {
        type: String,
        minLength: 3,
        require: true
    },
    password: {
        type: String,
        minLength: 3,
        require: true
    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    }
});

const userModel = mongoose.model(userCollection, userSchema);

export default userModel;