const checkDownload = async (result) => {
    const downloadImage = result[0];

    if (getMime(downloadImage) == 'image/webp') {
        // Cancel the download of the webp
        cancelCurrentDownload(downloadImage.id);
        // Get the buffer of the image
        const webpBuffer = await getBuffer(downloadImage.url);
        const pngBlob = await convertWebPToPNG(webpBuffer);

        const regex = /\/([^\/]+)\.webp$/;
        const match = regex.exec(downloadImage.filename);
        const fileName = match ? match[1] : null;

        try {
            browser.downloads.download({
                url: URL.createObjectURL(pngBlob),
                filename: fileName != null ? fileName + '.png' : ''
            });

        } catch (error) {
            console.error(error);
        }
    }
}

const getMime = (downloadImage) => {
    if (downloadImage.mime) return downloadImage.mime;
    if (/\.webp$/.test(downloadImage.url)) return 'image/webp';
    return '';
}

const cancelCurrentDownload = async (id) => {
    browser.downloads.cancel(id, () => {
        console.log('Stopped correctly');
        browser.downloads.erase({ id: id }, () => {
            console.log('Erased corretcly');
        });
    });
}

const getBuffer = async (link) => {
    try {
        const res = await fetch(link);
        const buffer = await res.arrayBuffer();
        return buffer;

    } catch (e) {
        console.error(e);
        return false;
    }
}

const downloadListener = (downloadItem) => {
    browser.downloads.search({ id: downloadItem.id }, checkDownload)
}

async function convertWebPToPNG(webpArrayBuffer) {
    const blob = new Blob([webpArrayBuffer], { type: 'image/webp' });

    const imageBitmap = await createImageBitmap(blob);

    const offscreenCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height);
    const context = offscreenCanvas.getContext('2d');

    context.drawImage(imageBitmap, 0, 0);

    const pngBlob = await offscreenCanvas.convertToBlob({ type: 'image/png' });

    return pngBlob;
}

browser.runtime.onMessage.addListener((request, sender, reply) => {
    const { activated } = request;

    if (activated) {
        browser.downloads.onChanged.addListener(downloadListener);
        reply({ done: true });
    } else {
        browser.downloads.onChanged.removeListener(downloadListener);
        reply({ done: false });
    }


    return true;
});