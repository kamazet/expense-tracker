// api/upload.js
import formidable from 'formidable-serverless';
import fs from 'fs';
import pdfParse from 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Error parsing form:', err);
      return res.status(500).json({ success: false, error: 'Form parsing error' });
    }

    const file = files.file;
    if (!file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    try {
      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);

      const text = pdfData.text;
      
      // 📝 Example parsing (you should customize based on your PDF)
      const transactions = text
        .split('\n')
        .filter((line) => /\d{2}\/\d{2}\/\d{4}/.test(line)) // naive date filter
        .map((line) => ({
          Date: line.slice(0, 10), // first 10 characters as Date
          Amount: parseFloat(line.match(/-?\d+\.\d{2}/)?.[0]) || 0, // first number as amount
          Description: line.slice(11), // rest as description
        }));

      res.status(200).json({
        success: true,
        transaction_data: transactions,
        transaction_count: transactions.length,
      });
    } catch (error) {
      console.error('Error processing PDF:', error);
      res.status(500).json({ success: false, error: 'Failed to process PDF' });
    }
  });
}
