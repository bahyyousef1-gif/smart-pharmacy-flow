import DataIngestionPipeline from "@/components/DataIngestion/DataIngestionPipeline";

const DemandForecastDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Demand Forecasting Dashboard
          </h1>
          <p className="text-muted-foreground">
            AI-powered inventory replenishment recommendations
          </p>
        </div>
      </div>

      {/* Data Ingestion Pipeline */}
      <DataIngestionPipeline />
    </div>
  );
};

export default DemandForecastDashboard;
