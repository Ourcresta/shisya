import { QRCodeSVG } from "qrcode.react";

interface QRCodeBlockProps {
  url: string;
  size?: number;
}

export default function QRCodeBlock({ url, size = 100 }: QRCodeBlockProps) {
  return (
    <div className="p-3 bg-white rounded-md border inline-block" data-testid="qr-code-block">
      <QRCodeSVG
        value={url}
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}
