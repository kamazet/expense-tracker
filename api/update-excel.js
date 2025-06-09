// api/update-excel.js
import { writeFile, unlink } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import XLSX from 'xlsx';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ success: false, message: 'Invalid transaction data' });
    }

    const ws = XLSX.utils.json_to_sheet(transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    const filename = `transactions-${uuidv4()}.xlsx`;
    const filepath = path.join('/tmp', filename); // Vercel allows writing to /tmp

    XLSX.writeFile(wb, filepath);

    res.status(200).json({ success: true, filename });
  } catch (error) {
    console.error('Error generating Excel:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Excel' });
  }
}
