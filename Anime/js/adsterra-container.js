// adsterra-container.js

export function renderAdsterraContainer(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const adLinks = [
    "https://raptripeessentially.com/vzyrnaz7zc?key=391b4a1582450f14e319d72f64c7cc3c",
    "https://raptripeessentially.com/rft89532?key=c6c77823af757f93e17bbfa7ebad2639",
    "https://raptripeessentially.com/a7mm18sw6?key=79442492f5fe436b0bc2484d9d0a8660",
    "https://raptripeessentially.com/y9x32b69?key=e34ce979bf4d0e0b4a7bc7a637034e73"
  ];

  // Pick a random link each time the script is run
  const selectedAd = adLinks[Math.floor(Math.random() * adLinks.length)];

  const style = `
    .ads-row {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: center;
      margin: 20px auto;
      max-width: 1200px;
    }
    .responsive-iframe-container {
      flex: 1 1 calc(25% - 20px);
      height: 150px;
      border: 1px solid #ddd;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      min-width: 200px;
    }
    @media (max-width: 991px) {
      .responsive-iframe-container {
        flex: 1 1 calc(50% - 20px);
      }
    }
    @media (max-width: 480px) {
      .responsive-iframe-container {
        flex: 1 1 100%;
      }
    }
  `;

  const styleTag = document.createElement('style');
  styleTag.textContent = style;
  document.head.appendChild(styleTag);

  // Create iframe containers
  const adsRow = document.createElement('div');
  adsRow.className = 'ads-row';

  for (let i = 0; i < 4; i++) {
    const iframeContainer = document.createElement('div');
    iframeContainer.className = 'responsive-iframe-container';

    const iframe = document.createElement('iframe');
    iframe.src = selectedAd;
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.loading = 'lazy';

    iframeContainer.appendChild(iframe);
    adsRow.appendChild(iframeContainer);
  }

  container.appendChild(adsRow);
}
