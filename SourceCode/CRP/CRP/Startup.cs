using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(CRP.Startup))]
namespace CRP
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
