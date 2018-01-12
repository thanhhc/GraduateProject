SELECT b.VehicleID, AVG(CAST(b.star as FLOAT)), COUNT(b.star)
FROM BookingReceipts as b
GROUP BY b.VehicleID

SELECT *
FROM BookingReceipts as b
WHERE b.CustomerID = 11