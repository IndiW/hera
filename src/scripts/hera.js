const BLOCKED_DOMAINS = ['lichess.org', 'youtube.com']

console.log('hera')
console.log(window.location.href)

for (const domain of BLOCKED_DOMAINS) {
    if (window.location.href.includes(domain)) {
        document.body.style.border = "10px solid blue";
    }
}