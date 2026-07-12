const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReportService {
  constructor(taskService, reportsDir = path.join(__dirname, '../../public/reports')) {
    this.taskService = taskService;
    this.reportsDir = reportsDir;

    // Ensure the reports directory exists
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }

  async generatePdfReport(jobId, updateProgress) {
    const filename = `report_${jobId}.pdf`;
    const filePath = path.join(this.reportsDir, filename);

    // 1. Fetch data & aggregate (10% to 50% progress)
    await updateProgress(15);
    const stats = await this.taskService.getStats();
    await updateProgress(35);
    const tasks = await this.taskService.getTasks();
    await updateProgress(50);

    // 2. Render PDF using PDFKit
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
        const writeStream = fs.createWriteStream(filePath);

        doc.pipe(writeStream);

        // Colors & Theme (Vibrant modern palette)
        const primaryColor = '#0f172a';    // Sleek dark slate
        const secondaryColor = '#4f46e5';  // Indigo accent
        const successColor = '#10b981';    // Green
        const pendingColor = '#f59e0b';    // Amber
        const textColor = '#334155';       // Dark neutral
        const lightBg = '#f8fafc';         // Off-white

        // Draw elegant Header Banner
        doc.rect(0, 0, 595.28, 120).fill(primaryColor);

        // Header Text
        doc.fillColor('#ffffff')
           .font('Helvetica-Bold')
           .fontSize(22)
           .text('FL-04 TASK AUDIT REPORT', 50, 40);

        doc.fontSize(10)
           .font('Helvetica')
           .text(`Generated on: ${new Date().toLocaleString()} | Job ID: ${jobId}`, 50, 75);

        // Logo / branding indicator
        doc.fillColor('#818cf8')
           .font('Helvetica-Bold')
           .fontSize(14)
           .text('FLYRANK AI', 460, 42);

        // Move cursor down to page body
        doc.y = 150;

        // Progress update
        updateProgress(70);

        // --- SUMMARY SECTION ---
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(16)
           .text('Executive Summary', 50, 150);

        // Draw 3 dashboard cards side-by-side
        const cardY = 180;
        const cardHeight = 70;
        const cardWidth = 150;

        // Card 1: Total Tasks
        doc.roundedRect(50, cardY, cardWidth, cardHeight, 6).fill(lightBg);
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(20).text(`${stats.total}`, 70, cardY + 15);
        doc.fillColor(textColor).font('Helvetica').fontSize(10).text('Total Tasks', 70, cardY + 45);

        // Card 2: Completed Tasks
        doc.roundedRect(220, cardY, cardWidth, cardHeight, 6).fill(lightBg);
        doc.fillColor(successColor).font('Helvetica-Bold').fontSize(20).text(`${stats.completed}`, 240, cardY + 15);
        doc.fillColor(textColor).font('Helvetica').fontSize(10).text('Completed Tasks', 240, cardY + 45);

        // Card 3: Pending Tasks
        doc.roundedRect(390, cardY, cardWidth, cardHeight, 6).fill(lightBg);
        doc.fillColor(pendingColor).font('Helvetica-Bold').fontSize(20).text(`${stats.pending}`, 410, cardY + 15);
        doc.fillColor(textColor).font('Helvetica').fontSize(10).text('Pending Tasks', 410, cardY + 45);

        // Draw progress bar
        const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
        const barLabelY = cardY + cardHeight + 25;
        doc.fillColor(primaryColor).font('Helvetica-Bold').fontSize(12).text(`Completion Progress: ${completionRate}%`, 50, barLabelY);

        // Draw actual bar background
        const barY = barLabelY + 18;
        doc.rect(50, barY, 490, 12).fill('#e2e8f0');
        // Draw filled progress
        if (completionRate > 0) {
          doc.rect(50, barY, (490 * completionRate) / 100, 12).fill(successColor);
        }

        // --- DETAILED TASKS TABLE ---
        const tableStartY = barY + 30;
        doc.fillColor(primaryColor)
           .font('Helvetica-Bold')
           .fontSize(16)
           .text('Detailed Task Inventory', 50, tableStartY);

        const tableHeaderY = tableStartY + 25;

        // Table Header
        doc.rect(50, tableHeaderY, 490, 25).fill(primaryColor);
        doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
        doc.text('ID', 65, tableHeaderY + 8);
        doc.text('Task Title', 110, tableHeaderY + 8);
        doc.text('Status', 450, tableHeaderY + 8);

        let rowY = tableHeaderY + 25;

        // Render tasks
        doc.font('Helvetica').fontSize(9);
        tasks.forEach((task, index) => {
          // Simple page overflow check before drawing
          if (rowY > 740) {
            doc.addPage();
            // Draw table header on the new page
            doc.rect(50, 50, 490, 25).fill(primaryColor);
            doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
            doc.text('ID', 65, 58);
            doc.text('Task Title', 110, 58);
            doc.text('Status', 450, 58);
            rowY = 75;
            doc.font('Helvetica').fontSize(9);
          }

          // Zebra striping
          if (index % 2 === 0) {
            doc.rect(50, rowY, 490, 22).fill('#f8fafc');
          } else {
            doc.rect(50, rowY, 490, 22).fill('#ffffff');
          }

          doc.fillColor(textColor);
          doc.text(`${task.id}`, 65, rowY + 7);

          // Truncate long titles to fit table column
          const title = task.title.length > 55 ? task.title.substring(0, 52) + '...' : task.title;
          doc.text(title, 110, rowY + 7);

          // Draw Status badge text
          if (task.completed) {
            doc.fillColor(successColor).font('Helvetica-Bold').text('Completed', 450, rowY + 7);
          } else {
            doc.fillColor(pendingColor).font('Helvetica-Bold').text('Pending', 450, rowY + 7);
          }
          doc.font('Helvetica'); // Reset font style

          rowY += 22;
        });

        // Add page numbers footer to page(s)
        const range = doc.bufferedPageRange();
        for (let i = range.start; i < range.start + range.count; i++) {
          doc.switchToPage(i);
          
          // Temporarily remove bottom margin to prevent auto-page wrapping during footer draw
          const oldBottomMargin = doc.page.margins.bottom;
          doc.page.margins.bottom = 0;
          
          doc.fillColor('#94a3b8')
             .font('Helvetica')
             .fontSize(8)
             .text(`Page ${i + 1} of ${range.count}`, 50, 780, { align: 'center', width: 490 });
             
          // Restore bottom margin
          doc.page.margins.bottom = oldBottomMargin;
        }

        // Finalize (90% progress)
        updateProgress(90);

        doc.end();

        writeStream.on('finish', () => {
          resolve(`/reports/report_${jobId}.pdf`);
        });

        writeStream.on('error', (err) => {
          reject(err);
        });

      } catch (err) {
        reject(err);
      }
    });
  }
}

module.exports = ReportService;
