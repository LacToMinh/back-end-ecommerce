// models/role.model.js
import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },      // "staff", "admin"
  // permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }]
  permissions: [{ type: mongoose.Schema.Types.Mixed }]

});

const RoleModel = mongoose.model("Role", roleSchema);
export default RoleModel;
