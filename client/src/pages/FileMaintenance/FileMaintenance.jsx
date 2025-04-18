import React from "react";
import Navpath from "../../components/common/Navpath";

function FileMaintenance({ user, setUser }) {
  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath levelOne="File Maintenance" levelTwo="Home" levelThree="File Maintenance" />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid"></div>
        </section>
      </div>
    </div>
  );
}

export default FileMaintenance;
