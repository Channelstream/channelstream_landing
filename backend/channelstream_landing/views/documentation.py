import os
from pkg_resources import resource_exists, resource_isdir, resource_string

from pyramid.view import view_config
from pyramid.exceptions import HTTPNotFound
from pyramid.renderers import render_to_response
from channelstream_landing.utils import ssl_rewriter


@view_config(
    route_name="doc", match_param="page=index", renderer="../templates/documentation.jinja2"
)
def index(request):
    return {"ssl_rewriter": ssl_rewriter}


@view_config(route_name="doc")
def render_tutorial_page(request):
    page_path = request.matchdict.get("page")

    resouce_path = os.path.join("../templates/pages", f"{page_path}.jinja2")
    exists = resource_exists("channelstream_landing", resouce_path[2:])
    if not exists:
        raise HTTPNotFound()

    return render_to_response(resouce_path, {"ssl_rewriter": ssl_rewriter}, request)
