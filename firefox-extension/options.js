const label = document.getElementById('label');
const toggle = document.getElementById('toggle');

const checked = JSON.parse(localStorage.getItem('webp_toggle') || false);

toggle.checked = checked;

toggle.addEventListener('change', (ev) => {
    const checked = ev.target.checked;
    localStorage.setItem('webp_toggle', checked);

    requestPermissions();

    browser.runtime.sendMessage({ activated: checked }, function (response) {
        console.log(response.done);
    });
})

const permissionsToRequest = {
    origins: ["<all_urls>"]
}

async function requestPermissions() {
    function onResponse(response) {
        if (response) {
            console.log("Permission was granted");
        } else {
            console.log("Permission was refused");
        }

        return browser.permissions.getAll();
    }

    const response = await browser.permissions.request(permissionsToRequest);
    const currentPermissions = await onResponse(response);
}