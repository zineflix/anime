// Script to Disable Right-Click function and redirect to another page if checking Developers Tools // 
// Disable Right-Click
document.addEventListener('contextmenu', function (event) {
    event.preventDefault();
});

// Disable Keyboard Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U)
document.addEventListener('keydown', function (event) {
    if (event.key === "F12" || 
        (event.ctrlKey && event.shiftKey && event.key === "I") || 
        (event.ctrlKey && event.shiftKey && event.key === "J") || 
        (event.ctrlKey && event.key === "U")) {
        event.preventDefault();
    }
});

// Redirect to Google if DevTools is Opened
setInterval(function(){
    if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200){
        window.location.href = "https://www.google.com"; // Redirect to Adsterra Ads
    }
}, 1000);

// Prevent iFrame Embedding (Clickjacking Protection)
if (window !== window.top) {
    window.top.location = window.location;
}

// Prevent Viewing Page Source
document.onkeydown = function(e) {
    if (e.keyCode == 123) { return false; } // F12
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'I'.charCodeAt(0)) { return false; } // Ctrl+Shift+I
    if (e.ctrlKey && e.shiftKey && e.keyCode == 'J'.charCodeAt(0)) { return false; } // Ctrl+Shift+J
    if (e.ctrlKey && e.keyCode == 'U'.charCodeAt(0)) { return false; } // Ctrl+U
}; 
