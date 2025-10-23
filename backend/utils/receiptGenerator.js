const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const generateReturnReceipt = (request, student, book) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `return_receipt_${request._id}_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '..', 'receipts', filename);

    // Ensure receipts directory exists
    const receiptsDir = path.join(__dirname, '..', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Library Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Book Return Receipt', { align: 'center' });
    doc.moveDown();

    // Receipt details
    doc.fontSize(12);
    doc.text(`Receipt ID: ${request._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Student details
    doc.text('Student Details:');
    doc.text(`Name: ${student.name}`);
    doc.text(`Enrollment No: ${student.enrollmentNo}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown();

    // Book details
    doc.text('Book Details:');
    doc.text(`Title: ${book.title}`);
    doc.text(`Author: ${book.author}`);
    doc.text(`ISBN: ${book.isbn}`);
    doc.moveDown();

    // Return details
    doc.text('Return Details:');
    doc.text(`Issue Date: ${new Date(request.issueDate).toLocaleDateString()}`);
    doc.text(`Due Date: ${new Date(request.dueDate).toLocaleDateString()}`);
    doc.text(`Return Date: ${new Date(request.returnDate).toLocaleDateString()}`);

    const daysLate = Math.max(0, Math.ceil((new Date(request.returnDate) - new Date(request.dueDate)) / (1000 * 60 * 60 * 24)));
    if (daysLate > 0) {
      doc.text(`Days Late: ${daysLate}`);
      doc.text(`Penalty: ₹${request.penalty}`);
      doc.text(`Penalty Status: ${request.penaltyPaid ? 'Paid' : 'Unpaid'}`);
    } else {
      doc.text('Status: Returned on time');
    }

    doc.moveDown();
    doc.text('Thank you for using our library services!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/receipts/${filename}`));
    stream.on('error', reject);
  });
};

const generatePenaltyReceipt = (penalty, student, book) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const filename = `penalty_receipt_${penalty._id}_${Date.now()}.pdf`;
    const filepath = path.join(__dirname, '..', 'receipts', filename);

    // Ensure receipts directory exists
    const receiptsDir = path.join(__dirname, '..', 'receipts');
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(20).text('Library Management System', { align: 'center' });
    doc.moveDown();
    doc.fontSize(16).text('Penalty Payment Receipt', { align: 'center' });
    doc.moveDown();

    // Receipt details
    doc.fontSize(12);
    doc.text(`Receipt ID: ${penalty._id}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Student details
    doc.text('Student Details:');
    doc.text(`Name: ${student.name}`);
    doc.text(`Enrollment No: ${student.enrollmentNo}`);
    doc.text(`Email: ${student.email}`);
    doc.moveDown();

    // Book details
    doc.text('Book Details:');
    doc.text(`Title: ${book.title}`);
    doc.text(`Author: ${book.author}`);
    doc.moveDown();

    // Penalty details
    doc.text('Penalty Details:');
    doc.text(`Reason: ${penalty.reason}`);
    doc.text(`Amount: ₹${penalty.amount}`);
    doc.text(`Penalty Date: ${new Date(penalty.date).toLocaleDateString()}`);
    doc.text(`Payment Date: ${new Date(penalty.paidDate).toLocaleDateString()}`);
    doc.text('Status: Paid');

    doc.moveDown();
    doc.text('Payment received. Thank you!', { align: 'center' });

    doc.end();

    stream.on('finish', () => resolve(`/receipts/${filename}`));
    stream.on('error', reject);
  });
};

module.exports = {
  generateReturnReceipt,
  generatePenaltyReceipt
};
