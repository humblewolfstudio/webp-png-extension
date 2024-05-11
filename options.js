const label = document.getElementById('label');
const toggle = document.getElementById('toggle');

toggle.checked = localStorage.getItem('webp_toggle', false);

toggle.addEventListener('change', (ev) => {
    const checked = ev.target.checked;
    localStorage.setItem('webp_toggle', checked);

    chrome.runtime.sendMessage({ activated: checked }, function (response) {
        console.log(response.done);
    });
})