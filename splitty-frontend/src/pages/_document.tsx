import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="emotion-insertion-point" content="" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#0F172A" />
        <meta name="msapplication-navbutton-color" content="#0F172A" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <style jsx global>{`
          html, body {
            margin: 0;
            padding: 0;
            background-color: #0F172A !important;
            color: #F8FAFC !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
            width: 100%;
            min-height: 100vh;
          }
          
          #__next {
            background-color: #0F172A !important;
            color: #F8FAFC !important;
            min-height: 100vh;
            width: 100%;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Dark scrollbar for webkit browsers */
          ::-webkit-scrollbar {
            width: 8px;
          }
          ::-webkit-scrollbar-track {
            background: #1E293B;
          }
          ::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: #475569;
          }
        `}</style>
      </Head>
      <body style={{ 
        backgroundColor: '#0F172A', 
        color: '#F8FAFC',
        margin: 0,
        padding: 0,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        minHeight: '100vh',
        width: '100%',
        overflowX: 'hidden'
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 