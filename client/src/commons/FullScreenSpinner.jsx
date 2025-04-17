const FullScreenSpinner = () => (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: 9999,
      }}
    >
      <div className="spinner-border text-light" role="status" />
    </div>
  );
  
  export default FullScreenSpinner;
  