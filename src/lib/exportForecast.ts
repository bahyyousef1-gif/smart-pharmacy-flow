import jsPDF from "jspdf";
import "jspdf-autotable";

interface ProductForecast {
  drugName: string;
  currentStock: number;
  avgMonthlySales: number;
  predictedDemand: {
    low: number;
    medium: number;
    high: number;
  };
  trend: "increasing" | "stable" | "decreasing";
  confidence: number;
  reorderPoint: number;
  suggestedOrderQty: number;
  daysUntilStockout: number;
}

interface ForecastResult {
  predictions: ProductForecast[];
  overallInsights: string;
  seasonalPatterns: string;
  riskAnalysis: string;
  timestamp: string;
}

// CSV Export
export const exportForecastToCSV = (
  forecastResult: ForecastResult,
  forecastHorizon: number
): void => {
  const headers = [
    "Product",
    "Current Stock",
    "Predicted Demand (Low)",
    "Predicted Demand (Medium)",
    "Predicted Demand (High)",
    "Trend",
    "Confidence (%)",
    "Reorder Point",
    "Suggested Order Qty",
    "Days Until Stockout",
  ];

  const rows = forecastResult.predictions.map((p) => [
    p.drugName,
    p.currentStock,
    p.predictedDemand.low,
    p.predictedDemand.medium,
    p.predictedDemand.high,
    p.trend,
    Math.round(p.confidence * 100),
    p.reorderPoint,
    p.suggestedOrderQty,
    p.daysUntilStockout,
  ]);

  // Add metadata rows at the top
  const metadata = [
    ["AI Demand Forecast Report"],
    [`Generated: ${new Date(forecastResult.timestamp).toLocaleString()}`],
    [`Forecast Horizon: ${forecastHorizon} days`],
    [`Total Products Analyzed: ${forecastResult.predictions.length}`],
    [],
    ["Overall Insights:", forecastResult.overallInsights],
    ["Seasonal Patterns:", forecastResult.seasonalPatterns],
    ["Risk Analysis:", forecastResult.riskAnalysis],
    [],
  ];

  const csvContent = [
    ...metadata.map((row) => row.join(",")),
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => (typeof cell === "string" && cell.includes(",") ? `"${cell}"` : cell)).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `forecast_report_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export
export const exportForecastToPDF = (
  forecastResult: ForecastResult,
  forecastHorizon: number
): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text("AI Demand Forecast Report", pageWidth / 2, 20, { align: "center" });

  // Metadata
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated: ${new Date(forecastResult.timestamp).toLocaleString()}`,
    pageWidth / 2,
    28,
    { align: "center" }
  );
  doc.text(
    `Forecast Horizon: ${forecastHorizon} days | Products Analyzed: ${forecastResult.predictions.length}`,
    pageWidth / 2,
    34,
    { align: "center" }
  );

  // Insights Section
  let yPos = 45;

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Executive Summary", 14, yPos);
  yPos += 8;

  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);

  // Overall Insights
  doc.setFont("helvetica", "bold");
  doc.text("Overall Insights:", 14, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  const insightsLines = doc.splitTextToSize(
    forecastResult.overallInsights || "Analysis completed based on historical data.",
    pageWidth - 28
  );
  doc.text(insightsLines, 14, yPos);
  yPos += insightsLines.length * 4 + 6;

  // Seasonal Patterns
  doc.setFont("helvetica", "bold");
  doc.text("Seasonal Patterns:", 14, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  const seasonalLines = doc.splitTextToSize(
    forecastResult.seasonalPatterns || "Seasonal analysis based on sales trends.",
    pageWidth - 28
  );
  doc.text(seasonalLines, 14, yPos);
  yPos += seasonalLines.length * 4 + 6;

  // Risk Analysis
  doc.setFont("helvetica", "bold");
  doc.text("Risk Analysis:", 14, yPos);
  doc.setFont("helvetica", "normal");
  yPos += 5;
  const riskLines = doc.splitTextToSize(
    forecastResult.riskAnalysis || "Monitor stock levels for timely reordering.",
    pageWidth - 28
  );
  doc.text(riskLines, 14, yPos);
  yPos += riskLines.length * 4 + 10;

  // Product Predictions Table
  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.text("Product Demand Predictions", 14, yPos);
  yPos += 6;

  const tableData = forecastResult.predictions.map((p) => [
    p.drugName.length > 15 ? p.drugName.substring(0, 15) + "..." : p.drugName,
    p.currentStock.toString(),
    `${p.predictedDemand.low}-${p.predictedDemand.medium}-${p.predictedDemand.high}`,
    p.trend,
    `${Math.round(p.confidence * 100)}%`,
    p.daysUntilStockout.toString(),
    p.suggestedOrderQty.toString(),
  ]);

  (doc as any).autoTable({
    startY: yPos,
    head: [
      [
        "Product",
        "Stock",
        "Demand (L-M-H)",
        "Trend",
        "Confidence",
        "Stockout",
        "Order Qty",
      ],
    ],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontSize: 8,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 7,
      textColor: 50,
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    columnStyles: {
      0: { cellWidth: 35 },
      1: { cellWidth: 18, halign: "center" },
      2: { cellWidth: 32, halign: "center" },
      3: { cellWidth: 22, halign: "center" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 20, halign: "center" },
      6: { cellWidth: 22, halign: "center" },
    },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" }
    );
  }

  doc.save(`forecast_report_${new Date().toISOString().split("T")[0]}.pdf`);
};
