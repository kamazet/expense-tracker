const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');
const pdfParse = require('pdf-parse');
const XLSX = require('xlsx');
const moment = require('moment');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure these folders exist
const UPLOAD_FOLDER = path.join(__dirname, '..', 'uploads');
const RESULTS_FOLDER = path.join(__dirname, '..', 'results');

fs.ensureDirSync(UPLOAD_FOLDER);
fs.ensureDirSync(RESULTS_FOLDER);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_FOLDER),
  filename: (req, file, cb) => cb(null, file.originalname)
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  }
});

// PDF processing function
async function processPdf(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await pdfParse(dataBuffer);
    const text = pdfData.text;

    const transactionRegex = /(\d{2}\/\d{2})(.*?)(-?\d{1,3}(?:,\d{3})*(?:\.\d{2}))/g;
    const transactions = [];

    let match;
    while ((match = transactionRegex.exec(text)) !== null) {
      let [_, date, rawDescription, rawAmount] = match;

      let description = rawDescription.trim().replace(/\s+/g, ' ');

      const gluedPattern = /(\d{9,})(\d{1,3},\d{3}\.\d{2})/;
      const gluedMatch = gluedPattern.exec(description);
      if (gluedMatch) {
        description = description.replace(gluedPattern, `$1`);
        rawAmount = gluedMatch[2];
      }

      const amount = parseFloat(rawAmount.replace(/,/g, ''));

      transactions.push({
        Date: date,
        Category: '',
        Subcategory: '',
        Amount: amount * -1, // Flip signs
        Description: description
      });
    }

    if (transactions.length === 0) {
      return { success: false, message: 'No transactions found.', transaction_data: [] };
    }

    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const outputFile = path.join(RESULTS_FOLDER, `expense_tracker_${timestamp}.xlsx`);

    const worksheet = XLSX.utils.json_to_sheet(transactions, {
      header: ['Date', 'Category', 'Subcategory', 'Amount', 'Description']
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    XLSX.writeFile(workbook, outputFile);

    return {
      success: true,
      transaction_count: transactions.length,
      transaction_data: transactions,
      excel_file: path.basename(outputFile)
    };

  } catch (error) {
    console.error('Error processing PDF:', error);
    return { success: false, message: `Error processing PDF: ${error.message}`, transaction_data: [] };
  }
}

// Upload route
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const result = await processPdf(filePath);

  // Clean up uploaded file
  fs.unlink(filePath);

  if (result.success) {
    res.status(200).json({
      success: true,
      transaction_count: result.transaction_count,
      transaction_data: result.transaction_data,
      excel_file: result.excel_file
    });
  } else {
    res.status(200).json({
      success: false,
      message: result.message,
      transaction_data: []
    });
  }
});

// Update Excel route
app.post('/api/update-excel', async (req, res) => {
  try {
    const { transactions, filename } = req.body;

    if (!transactions || !filename) {
      return res.status(400).json({ success: false, message: 'Missing transactions or filename.' });
    }

    const formattedTransactions = transactions.map(t => ({
      Date: t.Date || '',
      Category: t.Category || '',
      Subcategory: t.Subcategory || '',
      Amount: t.Amount ?? '',
      Description: t.Description || ''
    }));

    const timestamp = moment().format('YYYYMMDD_HHmmss');
    const newFilename = `updated_expense_tracker_${timestamp}.xlsx`;
    const outputFile = path.join(RESULTS_FOLDER, newFilename);

    const worksheet = XLSX.utils.json_to_sheet(formattedTransactions, {
      header: ['Date', 'Category', 'Subcategory', 'Amount', 'Description']
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');
    XLSX.writeFile(workbook, outputFile);

    res.status(200).json({
      success: true,
      message: 'Excel file updated successfully.',
      filename: newFilename
    });

  } catch (error) {
    console.error('Error updating Excel file:', error);
    res.status(500).json({ success: false, message: `Error updating Excel file: ${error.message}` });
  }
});

// Download route
app.get('/api/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(RESULTS_FOLDER, filename);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found.' });
  }

  res.download(filePath, filename, (err) => {
    if (err) {
      console.error('Download error:', err);
      if (!res.headersSent) {
        res.status(500).json({ success: false, message: 'Could not download file.' });
      }
    }
  });
});

// Local development port
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app; // Important for Vercel
