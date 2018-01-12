using Autofac;
using Autofac.Integration.Mvc;
using AutoMapper;
using CRP.Controllers;
using CRP.Models;
using CRP.Models.AutofacModules;
using CRP.Models.Entities;
using CRP.Models.Entities.Repositories;
using CRP.Models.Entities.Services;
using CRP.Models.ViewModels;
using Microsoft.AspNet.Identity;
using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Net.Mail;
using System.Reflection;
using System.Security.Principal;
using System.Threading;
using System.Web;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;
using System.Web.Security;

namespace CRP
{
    public class MvcApplication : System.Web.HttpApplication
    {
        protected void Application_Start()
        {

            AreaRegistration.RegisterAllAreas();
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);
            BundleConfig.RegisterBundles(BundleTable.Bundles);

            Database.SetInitializer<ApplicationDbContext>(null);
            this.InitializeAutofac();
            SetUpTimer(new TimeSpan(23, 50, 00));
        }
        private Timer timer;
        private void SetUpTimer(TimeSpan alertTime)
        {
            DateTime current = DateTime.Now;
            TimeSpan timeToGo = alertTime - current.TimeOfDay;
            if (timeToGo < TimeSpan.Zero)
            {
                return;//time already passed
            }
            timer = new Timer(x =>
            {
                CheckProviderEndDate();
            }, null, timeToGo, Timeout.InfiniteTimeSpan);
        }

        private void CheckProviderEndDate()
        {
            var dbContext = new CRPEntities();
            DateTime current = DateTime.Now;
            var userService = new UserService(new UnitOfWork(dbContext), new UserRepository(dbContext));
            var listUser = userService.Get(q => q.AspNetRoles.Any(r => r.Name == "Provider") && q.IsProviderUntil < current);
            foreach (var user in listUser)
            {
                var userRole = user.AspNetRoles.Where(q => q.Name == "Provider").FirstOrDefault();
                user.AspNetRoles.Remove(userRole);
            }
            dbContext.SaveChanges();
            //AlertToNextProvider();
            var next3Days = new DateTime(current.Year, current.Month, current.Day + 3, current.Hour, current.Minute, current.Second);
            var next2Days = new DateTime(current.Year, current.Month, current.Day + 2, current.Hour, current.Minute, current.Second);
            var userEndInNext3Days = userService.Get(q => q.AspNetRoles.Any(r => r.Name == "Provider") && q.IsProviderUntil < next3Days && q.IsProviderUntil > next2Days);
            foreach (var user in userEndInNext3Days)
            {
                SendExpiredAlertEmailToProvider(user);
            }
        }

        private void SendExpiredAlertEmailToProvider(AspNetUser user)
        {
            var mailMessage = new MailMessage("crpservices2@gmail.com", user.Email)
            {
                Subject = "CRP - Thông tin gia hạn tài khoản",
                Body = "Xin chào, " + user.FullName + "\n"
                + "Chúng tôi gởi mail này để thông báo rằng quyền cung cấp của bạn sẽ hết hạn vào ngày "
                + user.IsProviderUntil.Value.Day+"/"+user.IsProviderUntil.Value.Month+"/"+user.IsProviderUntil.Value.Year+ ". Hãy gia hạn để có thể tiếp tục sử dụng dịch vụ của chúng tôi.\n"
                + "Xin chân thành cảm ơn vì đã tin dùng dịch vụ của chúng tôi.\n"
                + "Mọi chi tiết xin vui lòng liên hệ:\n"
                + "Email liên hệ: mailto:crpservices2@gmail.com"
                + "\nSố điện thoại: +841687548624"
            };

            var smtpClient = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new System.Net.NetworkCredential()
                {
                    UserName = "crpservices2@gmail.com",
                    Password = "A123456z"
                },
                EnableSsl = true,
            };
            smtpClient.Send(mailMessage);
        }

        private void InitializeAutofac()
        {
            var assembly = Assembly.GetExecutingAssembly();

            var builder = new ContainerBuilder();
            builder.RegisterControllers()
                .PropertiesAutowired();

            builder.RegisterModule(new RepositoryModule(assembly));
            builder.RegisterModule(new ServiceModule(assembly));
            builder.RegisterModule(new EntityFrameworkModule(assembly));
            builder.RegisterModule(new AutoMapperModule(new AutoMapper.MapperConfiguration(this.MapperConfig)));

            var container = builder.Build();

            DependencyResolver.SetResolver(new AutofacDependencyResolver(container));
        }

        public void MapperConfig(IMapperConfiguration config)
        {
            config.CreateMissingTypeMaps = true;
            config.CreateMap<VehicleGroup, VehicleGroupViewModel>();
        }
        protected void Application_AuthenticateRequest(Object sender, EventArgs e)
        {
            HttpCookie authCookie = Context.Request.Cookies[FormsAuthentication.FormsCookieName];
            if (authCookie != null)
            {
                FormsAuthenticationTicket authTicket = FormsAuthentication.Decrypt(authCookie.Value);
                string[] roles = authTicket.UserData.Split(',');
                GenericPrincipal userPrincipal = new GenericPrincipal(new GenericIdentity(authTicket.Name), roles);
                Context.User = userPrincipal;
            }
        }
    }
}
