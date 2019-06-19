def ssl_rewriter(request, url):
    """
    rewrites server url based on http scheme
    :param request:
    :param url:
    :return:
    """
    environ = request.environ
    if (
            environ.get("HTTP_X_FORWARDED_PROTO") == "https"
            or environ.get("HTTP_X_FORWARDED_SSL") == "on"
    ):
        url = url.replace("http://", "https://").replace("ws://", "wss://")
    return url
