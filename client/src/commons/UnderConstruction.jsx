import React from "react";
import { Row, Col } from "react-bootstrap";
import { FaTools } from "react-icons/fa";

const UnderConstruction = () => {
  return (
    <>
      <Row>
        <Col>
          <FaTools size={80} className="mb-4 text-warning" />
          <h1 className="display-4">Page Under Construction</h1>
          <p className="lead">
            We're working hard to bring you something awesome. Stay tuned!
          </p>
          <div className="spinner-border text-warning mt-4" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default UnderConstruction;
