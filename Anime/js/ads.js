// ads.js
const adContainer = document.querySelector('.ads-row');

const adSources = [
  "https://beddingfetched.com/auasmuxjmw?key=c5441a31ac48e2c6a8daa8bc31f51097",
  "https://beddingfetched.com/auasmuxjmw?key=c5441a31ac48e2c6a8daa8bc31f51097",
  "https://beddingfetched.com/t2uad06p?key=83cc6b8e62e8049148b96dc45e536fc3",
  "https://beddingfetched.com/t2uad06p?key=83cc6b8e62e8049148b96dc45e536fc3"
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
