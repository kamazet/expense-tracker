const express = require('express');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const fs = require('fs-extra');
const XLSX = require('xlsx');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Set up Multer for file uploads
const upload = multer({ dest: 'uploads/' });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const pdfBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(pdfBuffer);

    // Dummy response: you would parse real transactions here
    const transactions = [
      { Date: '2024-01-01', Category: 'Food', Subcategory: 'Meal', Amount: 20.5, Description: 'Restaurant' }
    ];

    // Create an Excel file
    const worksheet = XLSX.utils.json_to_sheet(transactions);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    const fileName = `transactions_${Date.now()}.xlsx`;
    const filePath = path.join(__dirname, 'uploads', fileName);
    XLSX.writeFile(workbook, filePath);

    // Clean up uploaded PDF
    fs.unlinkSync(req.file.path);

    res.json({ success: true, transaction_data: transactions, excel_file: fileName, transaction_count: transactions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to process PDF.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
