const config: any = {
    // Latter '' assumes deployed to prod/container and React delivered as static site via node server
    SOCKET_URL: process.env.hasOwnProperty('REACT_APP_SOCKET_URL') ? `${process.env.REACT_APP_SOCKET_URL}` : ''
}

export { config };