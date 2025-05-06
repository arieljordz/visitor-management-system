import React from "react";
import { Card, Row, Col } from "react-bootstrap";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import Navpath from "../../components/common/Navpath";
import FeatureFlagToggle from "./FeatureFlagToggle";
import MenuConfigForm from "./MenuConfigForm";

function Settings({ user }) {
  const { flags } = useFeatureFlags();
  console.log("flags:", flags);
  return (
    <div>
      <div className="content-wrapper">
        {/* Content Header */}
        <Navpath levelOne="Settings" levelTwo="Home" levelThree="Settings" />

        {/* Main Content */}
        <section className="content">
          <div className="container-fluid">
            <Row className="justify-content-center">
              <Col md={8} lg={12}>
                {/* Card with conditional dark mode styling */}
                <Card>
                  <Card.Body className="main-card">
                    <section className="content">
                      <div className="container-fluid">
                        <div className="card card-primary card-outline">
                          <div className="card-body">
                            <FeatureFlagToggle />
                            {!flags.enableMenuConfig && <MenuConfigForm />}
                          </div>
                        </div>
                      </div>
                    </section>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Settings;
