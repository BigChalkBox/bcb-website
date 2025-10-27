// app/layout.js
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./globals.css";

export default function RootLayout({ children }) {
  return <html><body>{children}</body></html>;
}
