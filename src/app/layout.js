import './globals.css';
import Header from './components/Header';

export const metadata = {
  title: 'YoriForum — talk about anything',
  description: 'YoriForum is a fast, free, community forum. Sign in with GitHub and join the conversation.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container main">{children}</main>
        <footer className="footer">
          <div className="container footer-inner">
            <span>
              ⚡ <strong>YoriForum</strong> · runs free forever on Cloudflare Pages + Workers + D1
            </span>
            <span className="footer-links">
              <a href="https://github.com/harshi79/YoriForum" target="_blank" rel="noreferrer">
                Source
              </a>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
