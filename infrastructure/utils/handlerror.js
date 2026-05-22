function handleError(res, e, context = '') {
    console.error(`[ERROR] ${context}`, e);

    return res.status(500).json({
        success: false,
        message: e.message
    });
}

module.exports = handleError;