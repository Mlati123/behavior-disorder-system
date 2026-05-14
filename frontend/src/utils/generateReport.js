import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const generateReport = async (elementId) => {

  const input = document.getElementById(elementId);

  if (!input) return;

  const canvas = await html2canvas(input);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF("p", "mm", "a4");

  const imgProps = pdf.getImageProperties(imgData);

  const pdfWidth = pdf.internal.pageSize.getWidth();

  const pdfHeight =
    (imgProps.height * pdfWidth) / imgProps.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

  pdf.save("clinical-report.pdf");
};