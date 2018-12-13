//------------------------------------------------------------
// Copyright (c) Microsoft Corporation.  All rights reserved.
//------------------------------------------------------------
using BCP.Upload.Common;
using System.Web.Http;

namespace BCP.Upload.WebApi.Controllers
{
    public class AdminSettingsController : ApiController
    {
        public static AdminSettings settings;
        

        [HttpGet]
        public AdminSettings GetAdminSettings()
        {
            return settings;
        }

        [HttpPut]
        public void UpdateAdminSettings(AdminSettings newSettings)
        {
            if (newSettings == null)
            {
                throw ResponseExceptionHelper.ThrowResponseException(this.Request, System.Net.HttpStatusCode.BadRequest, ErrorMessages.NullInput);
            }

            settings = newSettings;
        }
    }
}
