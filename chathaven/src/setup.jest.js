jest.spyOn(console, "error").mockImplementation((...args) => {
    const messagesToIgnore = [
        "selectedUser is null or missing _id"
    ];

    const shouldSuppress = args.some(arg =>
        typeof arg === 'string' && messagesToIgnore.some(msg => arg.includes(msg))
    );

    if (!shouldSuppress) {
        console.warn(...args);
    }
});

jest.spyOn(console, "warn").mockImplementation((...args) => {
    const messagesToIgnore = [
        "Error fetching users:",
        "Error fetching user data",
        "Error: selectedChannel is null or missing _id."
    ];

    const shouldSuppress = args.some(arg =>
        typeof arg === 'string' && messagesToIgnore.some(msg => arg.includes(msg))
    );

    if (!shouldSuppress) {
        const originalWarn = jest.requireActual('console').warn;
        originalWarn(...args);
    }
});