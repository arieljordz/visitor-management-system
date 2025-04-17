import React, { useState, useEffect } from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import FormHeader from "../../commons/FormHeader";
import UnderConstruction from "../../commons/UnderConstruction";
import { useTheme } from "../../context/ThemeContext";

const API_URL = import.meta.env.VITE_BASE_API_URL;

const AdminDashboard = ({ user }) => {
  const { darkMode } = useTheme();
  const cardClass = darkMode ? "dashboard-card-dark" : "dashboard-card-light";
  return (
    <Container className="mt-6">
      <FormHeader
        levelOne="Home"
        levelTwo="Dashboard"
        levelThree={user?.name?.split(" ")[0]}
      />
      <Row className="justify-content-center">
        <Col md={10} lg={12}>
          <Card className={`shadow ${cardClass}`}>
            <Card.Body
              className="main-card d-flex justify-content-center align-items-center"
              style={{ minHeight: "400px" }}
            >
              <UnderConstruction />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
