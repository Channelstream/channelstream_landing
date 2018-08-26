from pyramid.view import view_config


@view_config(route_name='/', renderer='../templates/index.jinja2')
def my_view(request):
    return {'project': 'channelstream_landing'}
