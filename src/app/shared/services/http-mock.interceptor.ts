import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';

export const httpMockInterceptor: HttpInterceptorFn = (req, next) => {



  // Interceptar búsqueda de empleados
  if (req.url.includes('/api/employees/search')) {

    return of(new HttpResponse({
      status: 200,
      body: {
        data: [
          { id: '1', firstName: 'Juan', lastName: 'López', employeeType: 'fullTime', department: 'it', hireDate: '2023-01-15' },
          { id: '2', firstName: 'Ana', lastName: 'García', employeeType: 'partTime', department: 'hr', hireDate: '2023-03-10' }
        ],
        totalItems: 2
      }
    }));
  }
  // Interceptar búsqueda de tiendas
  else if (req.url.includes('/api/stores/search')) {

    return of(new HttpResponse({
      status: 200,
      body: {
        data: [
          { id: '1', name: 'Tienda Central', storeType: 'physical', foundedDate: '2020-05-15', active: true },
          { id: '2', name: 'E-Shop Premium', storeType: 'online', foundedDate: '2021-03-22', active: true },
          { id: '3', name: 'Mercado Plus', storeType: 'hybrid', foundedDate: '2019-11-10', active: false }
        ],
        totalItems: 3
      }
    }));
  }
  // Otras operaciones de tiendas
  else if (req.url.includes('/api/stores')) {

    return of(new HttpResponse({
      status: 200,
      body: {}
    }));
  }
  // Otras operaciones de empleados
  else if (req.url.includes('/api/employees')) {

    return of(new HttpResponse({
      status: 200,
      body: {}
    }));
  }
  return next(req);
};
