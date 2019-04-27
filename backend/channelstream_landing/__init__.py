from pyramid.config import Configurator, PHASE3_CONFIG
import markdown


def md_factory():
    def filter_markdown(value, *args, **kwargs):
        md = markdown.Markdown(
            extensions=[
                "markdown.extensions.abbr",
                "markdown.extensions.attr_list",
                "markdown.extensions.def_list",
                "markdown.extensions.footnotes",
                "markdown.extensions.tables",
                "markdown.extensions.admonition",
                "markdown.extensions.codehilite",
                "markdown.extensions.meta",
                "markdown.extensions.attr_list",
            ]
        )
        return md.convert(value.strip())

    return filter_markdown


def main(global_config, **settings):
    """ This function returns a Pyramid WSGI application.
    """
    config = Configurator(settings=settings)
    config.include('pyramid_jinja2')

    def pre_commit():
        jinja_env = config.get_jinja2_environment()
        jinja_env.filters['markdown'] = md_factory()

    config.action(None, pre_commit, order=PHASE3_CONFIG + 999)

    config.include('.routes')
    config.scan()
    return config.make_wsgi_app()
