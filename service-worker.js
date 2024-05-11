const checkDownload = async (result) => {
    const downloadImage = result[0];

    if (downloadImage.mime == 'image/webp') {
        // Cancel the download of the webp
        cancelCurrentDownload(downloadImage.id);
        // Get the buffer of the image
        const webpBuffer = await getBuffer(downloadImage.finalUrl);
        const pngBuffer = await convertWebPToPNG(webpBuffer);

        var base64 = btoa(
            new Uint8Array(pngBuffer)
                .reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        const pngObjectURL = `data:image/png;base64,${base64}`;

        const regex = /\/([^\/]+)\.webp$/;
        const match = regex.exec(downloadImage.filename);
        const fileName = match ? match[1] : null;

        chrome.downloads.download({
            url: pngObjectURL,
            filename: fileName != null ? './' + fileName + '.png' : ''
        });
    }
}

const cancelCurrentDownload = async (id) => {
    chrome.downloads.cancel(id, () => {
        console.log('Stopped correctly');
        chrome.downloads.erase({ id: id }, () => {
            console.log('Erased corretcly');
        });
    });
}

const getBuffer = async (link) => {
    const res = await fetch(link);
    const buffer = await res.arrayBuffer();
    return buffer;
}

const downloadListener = (downloadItem) => {
    if (!downloadItem.filename) return;
    chrome.downloads.search({ id: downloadItem.id }, checkDownload)
}

async function convertWebPToPNG(webpArrayBuffer) {
    const blob = new Blob([webpArrayBuffer], { type: 'image/webp' });

    const imageBitmap = await createImageBitmap(blob);

    const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = offscreenCanvas.getContext('2d');

    context.drawImage(imageBitmap, 0, 0);

    const pngBlob = await offscreenCanvas.convertToBlob({ type: 'image/png' });

    const pngArrayBuffer = await pngBlob.arrayBuffer();

    return pngArrayBuffer;
}

chrome.runtime.onMessage.addListener((request, sender, reply) => {
    const { activated } = request;

    if (activated) {
        chrome.downloads.onChanged.addListener(downloadListener);
        reply({ done: true });
    } else {
        chrome.downloads.onChanged.removeListener(downloadListener);
        reply({ done: false });
    }


    return true;
});