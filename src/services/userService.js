import userModel from "../dao/models/userModel.js";

export const userService = {
  getUsers() {
    try {
      return userModel.find().lean();
    } catch (error) {
      return error;
    }
  },
  getUsersById(id) {
    try {
      return userModel.findById({ _id: id });
    } catch (error) {
      return error;
    }
  },
  getUserByEmail(email) {
    try {
      return userModel.findOne({ email: email });
    } catch (error) {
      return error;
    }
  },
  createUser(user) {
    try {
      return userModel.create(user);
    } catch (error) {
      return error;
    }
  },
};