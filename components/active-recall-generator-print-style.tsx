"use client";

export function ActiveRecallGeneratorPrintStyle() {
  return (
    <style jsx global>{`
      @media print {
        @page {
          size: A4;
          margin: 14mm;
        }

        body {
          background: #ffffff !important;
        }

        .print\\:hidden {
          display: none !important;
        }
      }
    `}</style>
  );
}
