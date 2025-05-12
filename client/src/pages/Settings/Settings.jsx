import React from "react";
import { Tabs, Tab, Card, Row, Col } from "react-bootstrap";
import { useFeatureFlags } from "../../context/FeatureFlagContext";
import Navpath from "../../components/common/Navpath";
import FeatureFlagToggle from "./FeatureFlagToggle";
import MenuSettings from "./MenuSettings";
import SystemSettings from "./SystemSettings";
import AccessControlWrapper from "../../components/common/AccessControlWrapper.jsx";

function Settings() {
  const { flags } = useFeatureFlags();
  // console.log("flags:", flags);
  return (
    <AccessControlWrapper>
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
                            <Tabs
                              defaultActiveKey="featureFlags"
                              id="settings-tabs"
                              // className="mb-3"
                            >
                              {/* Feature Flags Tab */}
                              <Tab
                                eventKey="featureFlags"
                                title="Feature Flags"
                              >
                                <div>
                                  <Row>
                                    <Col md={8} lg={12}>
                                      <FeatureFlagToggle />
                                    </Col>
                                  </Row>
                                </div>
                              </Tab>
                              {/* Feature Flags Tab */}
                              <Tab
                                eventKey="systemSettings"
                                title="System Settings"
                              >
                                <div>
                                  <Row>
                                    <Col md={8} lg={12}>
                                      <SystemSettings />
                                    </Col>
                                  </Row>
                                </div>
                              </Tab>

                              {/* Menu Settings Tab (conditional rendering based on flag) */}
                              {flags.enableMenuConfig && (
                                <Tab
                                  eventKey="menuSettings"
                                  title="Menu Settings"
                                >
                                  <div>
                                    <Row>
                                      <Col md={8} lg={12}>
                                        <MenuSettings />
                                      </Col>
                                    </Row>
                                  </div>
                                </Tab>
                              )}
                            </Tabs>
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
    </AccessControlWrapper>
  );
}

export default Settings;
