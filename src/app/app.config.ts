import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { EMPLOYEE_FORM_CONFIG } from './features/employees/models/employee-form.config';
import { FormRegistryService } from './shared/services/form-registry.service';
import { httpMockInterceptor } from './shared/services/http-mock.interceptor';
import { STORE_FORM_CONFIG } from './features/stores/models/store-form.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([httpMockInterceptor])),

    provideAppInitializer(() => {
      console.log('Inicializando aplicación...');
      const formRegistry = inject(FormRegistryService);

      // Registrar formularios específicos
      formRegistry.registerForm(EMPLOYEE_FORM_CONFIG);
      formRegistry.registerForm(STORE_FORM_CONFIG);
      console.log('Formularios registrados:', EMPLOYEE_FORM_CONFIG.id, STORE_FORM_CONFIG.id);
      return Promise.resolve();
    })
  ]
};
