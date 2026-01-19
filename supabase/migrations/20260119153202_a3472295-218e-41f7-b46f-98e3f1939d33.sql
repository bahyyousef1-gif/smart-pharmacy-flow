-- Update min_stock based on item turnover from sales history
-- High turnover items (total sales > 3): min_stock = 7
-- Low turnover items (total sales <= 3): min_stock = 3

WITH item_turnover AS (
  SELECT 
    i.product_code,
    COALESCE(SUM(s."Net_Daily_Sales"), 0) as total_sales
  FROM "Inventory_2023" i
  LEFT JOIN "sales_history_2023" s ON i.product_code = s."Item_Code"
  GROUP BY i.product_code
)
UPDATE "Inventory_2023" inv
SET min_stock = CASE 
  WHEN it.total_sales > 3 THEN 7
  ELSE 3
END
FROM item_turnover it
WHERE inv.product_code = it.product_code;