import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import Navpath from "../../components/common/Navpath";
import { getFeeByCodeAndStatus } from "../../services/feeService.js";
import { FeeCodeEnum, PlanTypeEnum, PlanLimitEnum } from "../../enums/enums.js";

const currencyFormat = (amount) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(amount);

const PlanCard = ({ plan, onSelect }) => (
  <Col md={6} lg={6}>
    <Card className="mb-4 shadow-sm">
      <Card.Body>
        <h3>{plan.name}</h3>
        <Card.Subtitle className="mb-2 text-muted">{plan.price}</Card.Subtitle>
        <ul>
          {plan.features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <Button variant="primary" onClick={() => onSelect(plan.name)}>
          Choose {plan.name}
        </Button>
      </Card.Body>
    </Card>
  </Col>
);

const ChoosePlanPage = ({ onSelect }) => {
  const [fees, setFees] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const [prem1, prem2, prem3] = await Promise.all([
          getFeeByCodeAndStatus(FeeCodeEnum.PREM01),
          getFeeByCodeAndStatus(FeeCodeEnum.PREM02),
          getFeeByCodeAndStatus(FeeCodeEnum.PREM03),
        ]);
        setFees({
          [PlanTypeEnum.PREMIUM_1]: prem1.fee,
          [PlanTypeEnum.PREMIUM_2]: prem2.fee,
          [PlanTypeEnum.PREMIUM_3]: prem3.fee,
        });
      } catch (error) {
        console.error("Error fetching fee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFees();
  }, []);

  const plans = [
    {
      name: PlanTypeEnum.FREE_TRIAL,
      price: "₱0.00/month",
      features: [
        "Valid for 3 Days",
        "Access dashboard",
        "Generate QR",
        `Limited to ${PlanLimitEnum.FREE_TRIAL} Visitors`,
      ],
    },
    {
      name: PlanTypeEnum.PREMIUM_1,
      price: fees[PlanTypeEnum.PREMIUM_1]
        ? `${currencyFormat(fees[PlanTypeEnum.PREMIUM_1])}/month`
        : "Loading...",
      features: [
        "Valid for 1 Month",
        "All features",
        "Priority support",
        `Limited to ${PlanLimitEnum.PREMIUM_1} Visitors`,
      ],
    },
    {
      name: PlanTypeEnum.PREMIUM_2,
      price: fees[PlanTypeEnum.PREMIUM_2]
        ? `${currencyFormat(fees[PlanTypeEnum.PREMIUM_2])}/month`
        : "Loading...",
      features: [
        "Valid for 1 Month",
        "All features",
        "Priority support",
        `Limited to ${PlanLimitEnum.PREMIUM_2} Visitors`,
      ],
    },
    {
      name: PlanTypeEnum.PREMIUM_3,
      price: fees[PlanTypeEnum.PREMIUM_3]
        ? `${currencyFormat(fees[PlanTypeEnum.PREMIUM_3])}/month`
        : "Loading...",
      features: [
        "Valid for 1 Month",
        "All features",
        "Priority support",
        `Limited to ${PlanLimitEnum.PREMIUM_3} Visitors`,
      ],
    },
  ];

  return (
    <div className="content-wrapper">
      <Navpath levelOne="Subscribe" levelTwo="Home" levelThree="Subscribe" />
      <section className="content">
        <div className="container-fluid">
          <Row className="justify-content-center">
            <Col md={8} lg={12}>
              <Card>
                <Card.Body className="main-card">
                  <h2 className="text-center mb-4">Choose Your Plan</h2>
                  {loading ? (
                    <div className="text-center">Loading plans...</div>
                  ) : (
                    <Row>
                      {plans.map((plan, idx) => (
                        <PlanCard key={idx} plan={plan} onSelect={onSelect} />
                      ))}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </section>
    </div>
  );
};

export default ChoosePlanPage;
