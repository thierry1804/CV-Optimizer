declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      try {
        const typedarray = new Uint8Array(event.target?.result as ArrayBuffer);
        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        
        let fullText = '';
        
        // Iterate over each page and extract text
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map((item: any) => item.str).join(' ');
          fullText += pageText + '\n';
        }
        
        resolve(fullText);
      } catch (error) {
        console.error('Error parsing PDF:', error);
        reject(new Error("Impossible de lire le fichier PDF."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Erreur lors de la lecture du fichier."));
    };

    reader.readAsArrayBuffer(file);
  });
};