import { UserRoleEnum } from "../../enums/enums";

const RoleSelector = ({ role, onChange }) => (
  <div className="mb-3">
    <label>Role</label>
    <select
      className="form-control"
      value={role}
      onChange={(e) => onChange(e.target.value)}
      required
    >
      <option value="">Select role</option>
      <option value={UserRoleEnum.ADMIN}>Admin</option>
      <option value={UserRoleEnum.CLIENT}>Client</option>
      <option value={UserRoleEnum.STAFF}>Staff</option>
    </select>
  </div>
);

export default RoleSelector;
