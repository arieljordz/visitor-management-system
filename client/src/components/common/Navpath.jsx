import React from "react";

function Navpath({ levelOne, levelTwo, levelThree }) {
  return (
    <div>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">{levelOne}</h1>
            </div>
            <div className="col-sm-6">
              <ol className="breadcrumb float-sm-right">
                <li className="breadcrumb-item">
                  <a href="">{levelTwo}</a>
                </li>
                <li className="breadcrumb-item active">{levelThree}</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Navpath;
