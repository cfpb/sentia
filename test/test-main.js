var tests = [];
for (var file in window.__karma__.files) {
    if (window.__karma__.files.hasOwnProperty(file)) {
        if (/\.test\.js$/.test(file)) {
            tests.push(file);
            console.log(file);
        }
    }
}
