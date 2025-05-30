// ads.js
const adContainer = document.querySelector('.ads-row');

const adSources = [
  "https://preoccupyray.com/tphvme8i?key=74299c9df9b9420a02b6012d046a15a2",
  "https://preoccupyray.com/tphvme8i?key=74299c9df9b9420a02b6012d046a15a2",
  "https://preoccupyray.com/tphvme8i?key=74299c9df9b9420a02b6012d046a15a2",
  "https://preoccupyray.com/tphvme8i?key=74299c9df9b9420a02b6012d046a15a2"
];

adSources.forEach(src => {
  const wrapper = document.createElement("div");
  wrapper.className = "responsive-iframe-container";

  const iframe = document.createElement("iframe");
  iframe.src = src;
  iframe.width = "100%";
  iframe.height = "100%";
  iframe.style.border = "none";
  iframe.loading = "lazy";

  wrapper.appendChild(iframe);
  adContainer.appendChild(wrapper);
});
