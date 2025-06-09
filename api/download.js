// api/download.js
import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  const { filename } = req.query;

  if (!filename) {
    return res.status(400).send('Filename required');
  }

  const filepath = path.join('/tmp', filename);

  if (!fs.existsSync(filepath)) {
    return res.status(404).send('File not found');
  }

  res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

  const fileStream = fs.createReadStream(filepath);
  fileStream.pipe(res);
}
