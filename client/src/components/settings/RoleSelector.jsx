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
      <option value="">-- Select role --</option>
      <option value={UserRoleEnum.ADMIN}>{UserRoleEnum.ADMIN.toUpperCase()}</option>
      <option value={UserRoleEnum.SUBSCRIBER}>{UserRoleEnum.SUBSCRIBER.toUpperCase()}</option>
      <option value={UserRoleEnum.STAFF}>{UserRoleEnum.STAFF.toUpperCase()}</option>
    </select>
  </div>
);

export default RoleSelector;
