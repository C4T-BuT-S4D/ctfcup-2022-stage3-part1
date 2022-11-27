function access(r) {
    const whitelist = [
        "eth_blockNumber",
        "eth_call",
        "eth_chainId",
        "net_version"
    ];

    try {
        var payload = JSON.parse(r.requestBody);

        if (payload.jsonrpc !== "2.0") {
            r.return(401, "jsonrpc version not supported\n");
            return;
        }

        if (!whitelist.includes(payload.method)) {
            if (r.headersIn['Authorization'] !== 'Basic MDM4OGY0YWZlODhjNWQ3ZTU2NGE3ZTYyMjc2ZTgwMzE6') {
                r.return(401, "jsonrpc method is not allowed\n");
                return;
            }
        }

        if (Object.keys(payload).filter(key => key.toLowerCase() === 'method').length > 1) {
            r.return(401, "jsonrpc method is not allowed\n");
            return;
        }
    } catch (error) {
        r.return(415, "Cannot parse payload into JSON\n");
        return;
    }

    r.internalRedirect('@jsonrpc');
}

export default { access }
