from pyramid.view import view_config


@view_config(route_name='/', renderer='../templates/index.jinja2')
def index_view(request):
    return {'project': 'channelstream_landing'}


@view_config(route_name='demo_payload_relay', renderer='../templates/index.jinja2')
def demo_payload_relay(request):
    return {'project': 'channelstream_landing'}
