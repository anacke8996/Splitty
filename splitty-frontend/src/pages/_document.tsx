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
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <style jsx global>{`
          html {
            margin: 0;
            padding: 0;
            background: #0f172a !important;
            color: #F8FAFC !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            overflow-x: hidden;
            width: 100%;
            min-height: 100%;
            height: 100%;
            position: relative;
            /* Prevent overscroll and rubber band effects */
            overscroll-behavior: none;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
            /* Disable pull-to-refresh and bounce */
            -webkit-overscroll-behavior: none;
            -webkit-overflow-scrolling: touch;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%) !important;
            background-attachment: fixed !important;
            background-repeat: no-repeat !important;
            background-size: 100% 100% !important;
            color: #F8FAFC !important;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
            min-height: max(100vh, 100dvh);
            width: 100%;
            overflow-x: hidden;
            position: relative;
            /* Mobile-specific overscroll prevention */
            -webkit-overflow-scrolling: touch;
            overscroll-behavior: none;
            overscroll-behavior-y: none;
            touch-action: pan-y;
            /* Disable iOS Safari bounce */
            -webkit-overscroll-behavior: none;
            -webkit-overscroll-behavior-y: none;
          }
          
          /* Create multiple background layers for complete coverage */
          html::before {
            content: '';
            position: fixed;
            top: -100vh;
            left: -100vw;
            width: 300vw;
            height: 300vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%);
            z-index: -10;
            pointer-events: none;
          }
          
          body::before {
            content: '';
            position: fixed;
            top: -50vh;
            left: -50vw;
            width: 200vw;
            height: 200vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%);
            z-index: -5;
            pointer-events: none;
          }
          
          /* Additional viewport-based background for extreme overscroll */
          body::after {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e293b 100%);
            z-index: -3;
            pointer-events: none;
          }
          
          #__next {
            background: transparent !important;
            color: #F8FAFC !important;
            min-height: max(100vh, 100dvh);
            width: 100%;
            position: relative;
            z-index: 1;
          }
          
          * {
            box-sizing: border-box;
          }
          
          /* Enhanced mobile viewport handling */
          @supports (-webkit-touch-callout: none) {
            body {
              /* iOS Safari specific fix */
              position: relative;
              height: 100vh;
              height: 100dvh;
              overflow: hidden;
            }
            
            #__next {
              height: 100vh;
              height: 100dvh;
              overflow-y: auto;
              -webkit-overflow-scrolling: touch;
              overscroll-behavior: none;
            }
          }
          
          /* Prevent overscroll and rubber band effects */
          html {
            overscroll-behavior: none;
            touch-action: pan-y;
            -webkit-overflow-scrolling: touch;
          }
          
          /* Prevent text selection on touch devices during drag */
          * {
            -webkit-touch-callout: none;
            -webkit-user-select: none;
            -khtml-user-select: none;
            -moz-user-select: none;
            -ms-user-select: none;
            user-select: none;
          }
          
          /* Allow text selection in input fields and editable content */
          input, textarea, [contenteditable="true"] {
            -webkit-user-select: text;
            -khtml-user-select: text;
            -moz-user-select: text;
            -ms-user-select: text;
            user-select: text;
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
        background: 'transparent', // Let the fixed background show through
        color: '#F8FAFC',
        margin: 0,
        padding: 0,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        minHeight: 'max(100vh, 100dvh)', // Fallback for older browsers, modern viewport for mobile
        width: '100%',
        overflowX: 'hidden',
        position: 'relative',
        // Prevent bounce/rubber band scrolling on iOS and Android
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'none',
        // Disable pull-to-refresh on mobile
        overscrollBehaviorY: 'none',
        touchAction: 'pan-y',
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
} 