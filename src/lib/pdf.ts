import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

export interface LeaveRequestData {
  leaveType: string;
  registryNo: string;
  startDate: string;
  endDate: string;
  reason: string;
  documentNo: string;
}

export const generatePDF = async (
  elementId: string,
  filename: string,
  _data?: LeaveRequestData
): Promise<void> => {
  const fontStack =
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", "Helvetica Neue", Arial, sans-serif';

  const element = document.getElementById(elementId);
  if (!element) {
    console.error("PDF için hedef alan bulunamadı:", elementId);
    return;
  }

  const originalStyle = element.getAttribute("style") || "";
  element.style.fontFamily = fontStack;
  element.style.width = "794px"; // A4 @ 96dpi
  element.style.maxWidth = "794px";

  try {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      logging: false,
      letterRendering: true,
      width: element.scrollWidth,
      height: element.scrollHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc: Document) => {
        const clonedEl = clonedDoc.getElementById(elementId);
        if (!clonedEl) return;

        // Türkçe karakterleri tarayıcı fontuyla render etmek için
        // klonlanmış elementte font açıkça belirt
        clonedEl.style.fontFamily = fontStack;
        (clonedEl.style as any).webkitFontSmoothing = "antialiased";
        clonedEl.style.color = "#000000";

        // Tüm alt elementlerde de font'u zorla
        const allEls = clonedEl.querySelectorAll<HTMLElement>("*");
        allEls.forEach((el: HTMLElement) => {
          el.style.fontFamily = fontStack;
        });
      },
    } as any);

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
      compress: true,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const canvasAspect = canvas.height / canvas.width;
    const imgHeightInMM = pdfWidth * canvasAspect;

    if (imgHeightInMM <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, imgHeightInMM);
    } else {
      let remainingHeight = imgHeightInMM;
      let sourceY = 0;
      let isFirstPage = true;

      while (remainingHeight > 0) {
        if (!isFirstPage) pdf.addPage();

        const sliceHeightMM = Math.min(pdfHeight, remainingHeight);
        const sliceHeightPx = (sliceHeightMM / imgHeightInMM) * canvas.height;
        const sourceYPx = (sourceY / imgHeightInMM) * canvas.height;

        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.ceil(sliceHeightPx);
        const ctx = sliceCanvas.getContext("2d")!;
        ctx.drawImage(
          canvas,
          0,
          sourceYPx,
          canvas.width,
          Math.ceil(sliceHeightPx),
          0,
          0,
          canvas.width,
          Math.ceil(sliceHeightPx)
        );

        pdf.addImage(
          sliceCanvas.toDataURL("image/png", 1.0),
          "PNG",
          0,
          0,
          pdfWidth,
          sliceHeightMM
        );

        sourceY += sliceHeightMM;
        remainingHeight -= sliceHeightMM;
        isFirstPage = false;
      }
    }

    pdf.save(`${filename}.pdf`);
  } catch (err) {
    console.error("PDF oluşturulurken hata:", err);
  } finally {
    element.setAttribute("style", originalStyle);
  }
};