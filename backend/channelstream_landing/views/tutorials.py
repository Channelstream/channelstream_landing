from pyramid.view import view_config


@view_config(route_name='tutorials', match_param='view=index', renderer='../templates/tutorials.jinja2')
def index(request):
    return {}
