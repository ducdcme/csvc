async function rotateImage(fileId, direction) {

    try {

        const res = await fetch(
            `/admin/files/${fileId}/rotate`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    direction
                })
            }
        );

        const result = await res.json();

        if (!result.success) {
            return showError(result.message);
        }

        showSuccess(result.message);

        // reload image
        const img = document.querySelector(
            `[data-file-id="${fileId}"]`
        );

        if (img) {

            // force refresh browser cache
            img.src =
                img.src.split('?')[0] +
                '?t=' +
                Date.now();
        }

    } catch (err) {

        showError(err.message);

    }

}